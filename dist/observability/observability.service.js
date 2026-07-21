"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ObservabilityService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const audit_log_service_1 = require("../audit-log/audit-log.service");
const alb_service_1 = require("../orchestration/alb.service");
const project_deployment_entity_1 = require("../orchestration/project-deployment.entity");
const project_pipeline_run_entity_1 = require("../projects/project-pipeline-run.entity");
const project_entity_1 = require("../projects/project.entity");
const user_entity_1 = require("../users/user.entity");
const cloudwatch_logs_service_1 = require("./cloudwatch-logs.service");
const cloudwatch_metrics_service_1 = require("./cloudwatch-metrics.service");
const github_actions_metrics_service_1 = require("./github-actions-metrics.service");
const log_sanitizer_service_1 = require("./log-sanitizer.service");
const pipeline_metrics_service_1 = require("./pipeline-metrics.service");
const project_observability_event_entity_1 = require("./project-observability-event.entity");
const project_runtime_metric_snapshot_entity_1 = require("./project-runtime-metric-snapshot.entity");
const prometheus_service_1 = require("./prometheus.service");
const trivy_metrics_service_1 = require("./trivy-metrics.service");
let ObservabilityService = class ObservabilityService {
    constructor(projectRepository, runRepository, deploymentRepository, runtimeSnapshotRepository, eventRepository, pipelineMetrics, githubMetrics, trivyMetrics, prometheus, cloudWatchMetrics, cloudWatchLogs, albService, auditLogService, sanitizer) {
        this.projectRepository = projectRepository;
        this.runRepository = runRepository;
        this.deploymentRepository = deploymentRepository;
        this.runtimeSnapshotRepository = runtimeSnapshotRepository;
        this.eventRepository = eventRepository;
        this.pipelineMetrics = pipelineMetrics;
        this.githubMetrics = githubMetrics;
        this.trivyMetrics = trivyMetrics;
        this.prometheus = prometheus;
        this.cloudWatchMetrics = cloudWatchMetrics;
        this.cloudWatchLogs = cloudWatchLogs;
        this.albService = albService;
        this.auditLogService = auditLogService;
        this.sanitizer = sanitizer;
    }
    async getSummary(user, projectId) {
        const project = await this.findProjectForView(user, projectId);
        const latestRun = await this.runRepository.findOne({ where: { projectId: project.id }, order: { createdAt: "DESC" } });
        const deployment = await this.latestDeployment(project.id);
        const latestPipelineSummary = latestRun
            ? await this.pipelineMetrics.buildPipelineSummary(project.id, latestRun.id)
            : await this.pipelineMetrics.getLatestPipelineSummary(project.id);
        const targetHealth = await this.albService.getTargetHealth(project.id);
        await this.audit(user, "OBSERVABILITY_SUMMARY_VIEWED", project.id, "success", {});
        return {
            latestPipelineSummary,
            latestDeploymentStatus: deployment?.status || "not_deployed",
            logStreaming: { available: true, source: "cloudwatch_logs" },
            prometheus: this.prometheus.isEnabled()
                ? { enabled: true, message: "Prometheus is enabled." }
                : { enabled: false, message: "Prometheus is not configured." },
            cloudWatchFallback: {
                logsEnabled: true,
                metricsEnabled: this.cloudWatchMetrics.isEnabled(),
            },
            latestHealthSummary: targetHealth,
        };
    }
    async getPipelineMetrics(user, projectId, pipelineRunId) {
        const project = await this.findProjectForView(user, projectId);
        const run = pipelineRunId
            ? await this.runRepository.findOne({ where: { id: pipelineRunId, projectId: project.id } })
            : await this.runRepository.findOne({ where: { projectId: project.id }, order: { createdAt: "DESC" } });
        if (!run) {
            return { stageMetrics: [], summary: null, githubActions: null, trivyScan: null };
        }
        const [metrics, githubActions, trivyScan] = await Promise.all([
            this.pipelineMetrics.getPipelineMetrics(project.id, run.id),
            this.githubMetrics.fetchWorkflowRun(project.id, run.id).catch(() => null),
            this.trivyMetrics.getLatest(project.id, run.id),
        ]);
        await this.audit(user, "PIPELINE_METRICS_VIEWED", project.id, "success", { pipelineRunId: run.id });
        return {
            pipelineRunId: run.id,
            ...metrics,
            githubActions,
            trivyScan: trivyScan ? {
                id: trivyScan.id,
                scanStatus: trivyScan.scanStatus,
                startedAt: trivyScan.startedAt,
                completedAt: trivyScan.completedAt,
                durationMs: trivyScan.startedAt && trivyScan.completedAt ? trivyScan.completedAt.getTime() - trivyScan.startedAt.getTime() : null,
                totalVulnerabilities: trivyScan.totalVulnerabilities,
                criticalCount: trivyScan.criticalCount,
                highCount: trivyScan.highCount,
                mediumCount: trivyScan.mediumCount,
                lowCount: trivyScan.lowCount,
                unknownCount: trivyScan.unknownCount,
                policyDecision: trivyScan.policyDecision,
            } : null,
        };
    }
    async getRuntimeMetrics(user, projectId, source = "auto", range = "1h") {
        const project = await this.findProjectForView(user, projectId);
        const deployment = await this.latestDeployment(project.id);
        let runtime;
        if (source === "prometheus" || (source === "auto" && this.prometheus.isEnabled())) {
            runtime = await this.prometheus.getRuntimeMetrics(project.id, deployment, range);
            if (runtime.enabled !== false) {
                await this.saveRuntimeSnapshots(project.id, deployment, "prometheus", runtime);
            }
        }
        if (source === "prometheus") {
            await this.audit(user, "RUNTIME_METRICS_VIEWED", project.id, "success", { source, range });
            return runtime;
        }
        if (!runtime || runtime.enabled === false || source === "cloudwatch") {
            runtime = await this.cloudWatchMetrics.getRuntimeMetricFallback(project.id, deployment, range);
            if (runtime.enabled !== false) {
                await this.saveRuntimeSnapshots(project.id, deployment, "cloudwatch", runtime);
            }
        }
        await this.audit(user, "RUNTIME_METRICS_VIEWED", project.id, "success", { source, range });
        return runtime;
    }
    async getLogs(user, projectId, options) {
        const project = await this.findProjectForView(user, projectId);
        const result = await this.cloudWatchLogs.getRecentLogs(project.id, options);
        await this.audit(user, "CLOUDWATCH_LOGS_QUERIED", project.id, "success", {
            deploymentId: options.deploymentId,
            stream: options.stream || "all",
            limit: options.limit,
        });
        return result;
    }
    async getHealth(user, projectId) {
        const project = await this.findProjectForView(user, projectId);
        const deployment = await this.latestDeployment(project.id);
        const targetHealth = await this.albService.getTargetHealth(project.id);
        const cloudWatchLogGroup = await this.cloudWatchLogs.resolveLogGroupForProject(project.id, deployment?.id).catch(() => null);
        const health = {
            prometheus: this.prometheus.isEnabled() ? "configured" : "not_configured",
            cloudWatchLogs: cloudWatchLogGroup ? "available" : "unavailable",
            cloudWatchMetrics: this.cloudWatchMetrics.isEnabled() ? "available" : "disabled",
            latestEcsStatus: deployment?.status || "not_deployed",
            latestAlbHealth: targetHealth,
        };
        return health;
    }
    async recordEvent(projectId, eventType, status, message, actorUser, metadata = {}) {
        return this.eventRepository.save(this.eventRepository.create({
            projectId,
            eventType,
            status,
            message,
            actorUserId: actorUser?.id || null,
            metadata: this.sanitizer.sanitizeMetadata({ projectId, eventType, status, ...metadata }),
        }));
    }
    async findProjectForView(user, projectId) {
        const project = await this.projectRepository.findOne({ where: { id: projectId } });
        if (!project || project.status === project_entity_1.ProjectStatus.ARCHIVED) {
            throw new common_1.NotFoundException("Project not found");
        }
        if (user.role === user_entity_1.UserRole.ADMIN ||
            project.ownerUserId === user.id ||
            (user.role === user_entity_1.UserRole.READONLY && project.visibility === project_entity_1.ProjectVisibility.WORKSPACE)) {
            return project;
        }
        throw new common_1.ForbiddenException("Insufficient permissions");
    }
    latestDeployment(projectId) {
        return this.deploymentRepository.findOne({ where: { projectId }, order: { createdAt: "DESC" } });
    }
    async saveRuntimeSnapshots(projectId, deployment, source, runtime) {
        const metrics = ["cpu", "memory", "httpLatency", "requestRate"];
        for (const metricName of metrics) {
            const metric = runtime?.[metricName];
            const latest = metric?.points?.at?.(-1);
            if (!latest) {
                continue;
            }
            await this.runtimeSnapshotRepository.save(this.runtimeSnapshotRepository.create({
                projectId,
                deploymentId: deployment?.id || null,
                pipelineRunId: deployment?.pipelineRunId || null,
                source,
                metricName,
                metricUnit: metricName === "memory" ? "bytes" : null,
                value: Number(latest.value || 0),
                timestamp: new Date(latest.timestamp),
                labels: this.sanitizer.sanitizeMetadata(latest.labels || {}),
            }));
        }
    }
    audit(user, action, projectId, status, metadata) {
        return this.auditLogService.record({
            actorUser: user,
            action,
            resourceType: "observability",
            resourceId: projectId,
            status,
            metadata: this.sanitizer.sanitizeMetadata({ projectId, ...metadata }),
        });
    }
};
exports.ObservabilityService = ObservabilityService;
exports.ObservabilityService = ObservabilityService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(project_entity_1.Project)),
    __param(1, (0, typeorm_1.InjectRepository)(project_pipeline_run_entity_1.ProjectPipelineRun)),
    __param(2, (0, typeorm_1.InjectRepository)(project_deployment_entity_1.ProjectDeployment)),
    __param(3, (0, typeorm_1.InjectRepository)(project_runtime_metric_snapshot_entity_1.ProjectRuntimeMetricSnapshot)),
    __param(4, (0, typeorm_1.InjectRepository)(project_observability_event_entity_1.ProjectObservabilityEvent)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        pipeline_metrics_service_1.PipelineMetricsService,
        github_actions_metrics_service_1.GithubActionsMetricsService,
        trivy_metrics_service_1.TrivyMetricsService,
        prometheus_service_1.PrometheusService,
        cloudwatch_metrics_service_1.CloudWatchMetricsService,
        cloudwatch_logs_service_1.CloudWatchLogsService,
        alb_service_1.AlbService,
        audit_log_service_1.AuditLogService,
        log_sanitizer_service_1.LogSanitizerService])
], ObservabilityService);
//# sourceMappingURL=observability.service.js.map