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
exports.PipelineMetricsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const project_orchestration_event_entity_1 = require("../orchestration/project-orchestration-event.entity");
const project_pipeline_event_entity_1 = require("../projects/project-pipeline-event.entity");
const project_pipeline_run_entity_1 = require("../projects/project-pipeline-run.entity");
const log_sanitizer_service_1 = require("./log-sanitizer.service");
const project_pipeline_metric_summary_entity_1 = require("./project-pipeline-metric-summary.entity");
const project_stage_metric_entity_1 = require("./project-stage-metric.entity");
const STAGE_SOURCE = {
    github_actions: project_stage_metric_entity_1.StageMetricSource.GITHUB_ACTIONS,
    repository_clone: project_stage_metric_entity_1.StageMetricSource.PIPELINE,
    docker_build: project_stage_metric_entity_1.StageMetricSource.DOCKER,
    trivy_scan: project_stage_metric_entity_1.StageMetricSource.TRIVY,
    ecr_push: project_stage_metric_entity_1.StageMetricSource.ECR,
    terraform_plan: project_stage_metric_entity_1.StageMetricSource.TERRAFORM,
    finops_cost_analysis: project_stage_metric_entity_1.StageMetricSource.FINOPS,
    terraform_apply: project_stage_metric_entity_1.StageMetricSource.TERRAFORM,
    state_lock: project_stage_metric_entity_1.StageMetricSource.TERRAFORM,
    efs_provisioning: project_stage_metric_entity_1.StageMetricSource.TERRAFORM,
    ecs_deployment: project_stage_metric_entity_1.StageMetricSource.ECS,
    ecs_service_stability: project_stage_metric_entity_1.StageMetricSource.ECS,
    alb_health_check: project_stage_metric_entity_1.StageMetricSource.ALB,
    rollback: project_stage_metric_entity_1.StageMetricSource.ROLLBACK,
    spot_recovery: project_stage_metric_entity_1.StageMetricSource.ECS,
};
let PipelineMetricsService = class PipelineMetricsService {
    constructor(metricRepository, summaryRepository, runRepository, eventRepository, orchestrationEventRepository, sanitizer) {
        this.metricRepository = metricRepository;
        this.summaryRepository = summaryRepository;
        this.runRepository = runRepository;
        this.eventRepository = eventRepository;
        this.orchestrationEventRepository = orchestrationEventRepository;
        this.sanitizer = sanitizer;
    }
    async startStage(projectId, pipelineRunId, stageName, source, metadata = {}) {
        const existing = await this.metricRepository.findOne({
            where: { projectId, pipelineRunId, stageName },
            order: { createdAt: "DESC" },
        });
        const metric = existing || this.metricRepository.create({ projectId, pipelineRunId, stageName });
        metric.status = project_stage_metric_entity_1.StageMetricStatus.RUNNING;
        metric.source = source;
        metric.startedAt = metric.startedAt || new Date();
        metric.metadata = this.sanitizer.sanitizeMetadata({ ...metric.metadata, ...metadata, stageName, source });
        return this.metricRepository.save(metric);
    }
    async completeStage(projectId, pipelineRunId, stageName, metadata = {}) {
        return this.finishStage(projectId, pipelineRunId, stageName, project_stage_metric_entity_1.StageMetricStatus.SUCCEEDED, undefined, metadata);
    }
    async failStage(projectId, pipelineRunId, stageName, error, metadata = {}) {
        const reason = error instanceof Error ? error.message : String(error || "Stage failed.");
        return this.finishStage(projectId, pipelineRunId, stageName, project_stage_metric_entity_1.StageMetricStatus.FAILED, reason, metadata);
    }
    async skipStage(projectId, pipelineRunId, stageName, reason = "Stage skipped.") {
        return this.finishStage(projectId, pipelineRunId, stageName, project_stage_metric_entity_1.StageMetricStatus.SKIPPED, reason, {});
    }
    async getPipelineMetrics(projectId, pipelineRunId) {
        await this.buildStageMetricsFromEvents(projectId, pipelineRunId);
        const stageMetrics = await this.metricRepository.find({
            where: { projectId, pipelineRunId },
            order: { startedAt: "ASC", createdAt: "ASC" },
        });
        const summary = await this.buildPipelineSummary(projectId, pipelineRunId);
        return { stageMetrics, summary };
    }
    async getLatestPipelineSummary(projectId) {
        const existing = await this.summaryRepository.findOne({
            where: { projectId },
            order: { updatedAt: "DESC" },
        });
        if (existing) {
            return existing;
        }
        const latestRun = await this.runRepository.findOne({
            where: { projectId },
            order: { createdAt: "DESC" },
        });
        return latestRun ? this.buildPipelineSummary(projectId, latestRun.id) : null;
    }
    async buildPipelineSummary(projectId, pipelineRunId) {
        const run = await this.runRepository.findOne({ where: { id: pipelineRunId, projectId } });
        const metrics = await this.metricRepository.find({ where: { projectId, pipelineRunId } });
        const summary = await this.summaryRepository.findOne({ where: { projectId, pipelineRunId } })
            || this.summaryRepository.create({ projectId, pipelineRunId });
        summary.totalDurationMs = this.duration(run?.startedAt, run?.completedAt || run?.failedAt);
        summary.githubActionsDurationMs = this.stageDuration(metrics, "github_actions");
        summary.dockerBuildDurationMs = this.stageDuration(metrics, "docker_build");
        summary.trivyScanDurationMs = this.stageDuration(metrics, "trivy_scan");
        summary.ecrPushDurationMs = this.stageDuration(metrics, "ecr_push");
        summary.terraformPlanDurationMs = this.stageDuration(metrics, "terraform_plan");
        summary.terraformApplyDurationMs = this.stageDuration(metrics, "terraform_apply");
        summary.finopsDurationMs = this.stageDuration(metrics, "finops_cost_analysis");
        summary.ecsDeploymentDurationMs = this.stageDuration(metrics, "ecs_deployment");
        summary.albHealthCheckDurationMs = this.stageDuration(metrics, "alb_health_check");
        summary.rollbackDurationMs = this.stageDuration(metrics, "rollback");
        summary.status = run?.status || project_pipeline_run_entity_1.PipelineRunStatus.QUEUED;
        summary.metadata = this.sanitizer.sanitizeMetadata({
            projectId,
            pipelineRunId,
            status: summary.status,
        });
        return this.summaryRepository.save(summary);
    }
    async finishStage(projectId, pipelineRunId, stageName, status, reason, metadata = {}) {
        const metric = await this.metricRepository.findOne({
            where: { projectId, pipelineRunId, stageName },
            order: { createdAt: "DESC" },
        }) || this.metricRepository.create({
            projectId,
            pipelineRunId,
            stageName,
            source: STAGE_SOURCE[stageName] || project_stage_metric_entity_1.StageMetricSource.PIPELINE,
            startedAt: new Date(),
        });
        const endedAt = new Date();
        metric.status = status;
        metric.endedAt = endedAt;
        metric.durationMs = this.duration(metric.startedAt, endedAt);
        metric.metadata = this.sanitizer.sanitizeMetadata({
            ...metric.metadata,
            ...metadata,
            stageName,
            reason,
            durationMs: metric.durationMs,
        });
        return this.metricRepository.save(metric);
    }
    async buildStageMetricsFromEvents(projectId, pipelineRunId) {
        const existing = await this.metricRepository.find({ where: { projectId, pipelineRunId } });
        const byStage = new Map(existing.map((metric) => [metric.stageName, metric]));
        const pipelineEvents = await this.eventRepository.find({
            where: { projectId, pipelineRunId },
            order: { createdAt: "ASC" },
        });
        const orchestrationEvents = await this.orchestrationEventRepository.find({
            where: { projectId, pipelineRunId },
            order: { createdAt: "ASC" },
        });
        const candidates = [
            this.fromEvents("github_actions", pipelineEvents, ["github_actions_trigger_started"], ["github_actions_triggered"], ["github_actions_trigger_failed"]),
            this.fromEvents("repository_clone", pipelineEvents, ["cloning"], ["cloning"], []),
            this.fromEvents("docker_build", pipelineEvents, ["building_image"], ["building_image"], []),
            this.fromEvents("trivy_scan", pipelineEvents, ["security_scan_started"], ["security_scan_completed", "security_gate_passed"], ["security_gate_blocked", "security_approval_required"]),
            this.fromEvents("ecr_push", pipelineEvents, ["ecr_push_started"], ["ecr_image_pushed"], ["ecr_push_failed"]),
            this.fromEvents("terraform_plan", pipelineEvents, ["terraform_plan_started", "infrastructure_plan_started"], ["terraform_stage_completed", "infrastructure_plan_completed"], ["terraform_stage_failed"]),
            this.fromEvents("finops_cost_analysis", pipelineEvents, ["cost_analysis_started"], ["cost_approval_required", "deployment_blocked_by_cost_limit"], ["cost_analysis_failed"]),
            this.fromEvents("terraform_apply", pipelineEvents, ["infrastructure_apply_started"], ["infrastructure_apply_completed"], []),
            this.fromEvents("efs_provisioning", pipelineEvents, ["storage_evaluation_started"], ["storage_provisioned"], ["storage_provisioning_failed"]),
            this.fromEvents("ecs_deployment", pipelineEvents, ["ecs_service_deployment_started"], ["ecs_service_stable"], ["ecs_service_unhealthy"]),
            this.fromEvents("ecs_service_stability", orchestrationEvents, ["ecs_service_stability_wait_started"], ["ecs_service_stable"], ["ecs_service_stability_failed", "ecs_service_stability_timeout", "ecs_service_deployment_failed"]),
            this.fromEvents("alb_health_check", orchestrationEvents, ["alb_health_check_wait_started"], ["alb_targets_healthy"], ["alb_health_check_failed", "alb_health_check_timeout", "alb_targets_unhealthy"]),
            this.fromEvents("rollback", pipelineEvents, ["rollback_started"], ["rollback_succeeded"], ["rollback_failed"]),
            this.fromEvents("spot_recovery", orchestrationEvents, ["spot_interruption_detected"], ["spot_interruption_handled", "spot_interruption_recovery_skipped"], ["spot_interruption_recovery_failed"]),
        ].filter(Boolean);
        for (const candidate of candidates) {
            if (byStage.has(candidate.stageName)) {
                continue;
            }
            await this.metricRepository.save(candidate);
        }
    }
    fromEvents(stageName, events, starts, successes, failures) {
        const named = (event) => event.stage || event.eventType || "";
        const start = events.find((event) => starts.includes(named(event)));
        const success = [...events].reverse().find((event) => successes.includes(named(event)));
        const failure = [...events].reverse().find((event) => failures.includes(named(event)));
        const terminal = failure || success || start;
        if (!terminal) {
            return null;
        }
        const startedAt = start?.createdAt || terminal.createdAt;
        const endedAt = terminal === start && terminal.status === "running" ? null : terminal.createdAt;
        const status = failure
            ? project_stage_metric_entity_1.StageMetricStatus.FAILED
            : success
                ? project_stage_metric_entity_1.StageMetricStatus.SUCCEEDED
                : terminal.status === "skipped"
                    ? project_stage_metric_entity_1.StageMetricStatus.SKIPPED
                    : project_stage_metric_entity_1.StageMetricStatus.RUNNING;
        return this.metricRepository.create({
            projectId: terminal.projectId,
            pipelineRunId: terminal.pipelineRunId,
            deploymentId: terminal.deploymentId || null,
            stageName,
            source: STAGE_SOURCE[stageName] || project_stage_metric_entity_1.StageMetricSource.PIPELINE,
            status,
            startedAt,
            endedAt,
            durationMs: endedAt ? this.duration(startedAt, endedAt) : null,
            metadata: this.sanitizer.sanitizeMetadata({
                stageName,
                source: STAGE_SOURCE[stageName] || project_stage_metric_entity_1.StageMetricSource.PIPELINE,
                status,
                durationMs: endedAt ? this.duration(startedAt, endedAt) : null,
            }),
        });
    }
    stageDuration(metrics, stageName) {
        const metric = metrics.find((item) => item.stageName === stageName);
        return metric?.durationMs || null;
    }
    duration(start, end) {
        if (!start || !end) {
            return null;
        }
        return Math.max(0, end.getTime() - start.getTime());
    }
};
exports.PipelineMetricsService = PipelineMetricsService;
exports.PipelineMetricsService = PipelineMetricsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(project_stage_metric_entity_1.ProjectStageMetric)),
    __param(1, (0, typeorm_1.InjectRepository)(project_pipeline_metric_summary_entity_1.ProjectPipelineMetricSummary)),
    __param(2, (0, typeorm_1.InjectRepository)(project_pipeline_run_entity_1.ProjectPipelineRun)),
    __param(3, (0, typeorm_1.InjectRepository)(project_pipeline_event_entity_1.ProjectPipelineEvent)),
    __param(4, (0, typeorm_1.InjectRepository)(project_orchestration_event_entity_1.ProjectOrchestrationEvent)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        log_sanitizer_service_1.LogSanitizerService])
], PipelineMetricsService);
//# sourceMappingURL=pipeline-metrics.service.js.map