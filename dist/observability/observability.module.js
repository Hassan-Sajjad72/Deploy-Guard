"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ObservabilityModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const audit_log_module_1 = require("../audit-log/audit-log.module");
const alb_service_1 = require("../orchestration/alb.service");
const project_deployment_entity_1 = require("../orchestration/project-deployment.entity");
const project_orchestration_event_entity_1 = require("../orchestration/project-orchestration-event.entity");
const project_pipeline_event_entity_1 = require("../projects/project-pipeline-event.entity");
const project_pipeline_run_entity_1 = require("../projects/project-pipeline-run.entity");
const project_security_finding_entity_1 = require("../projects/project-security-finding.entity");
const project_security_scan_entity_1 = require("../projects/project-security-scan.entity");
const project_entity_1 = require("../projects/project.entity");
const cloudwatch_logs_service_1 = require("./cloudwatch-logs.service");
const cloudwatch_metrics_service_1 = require("./cloudwatch-metrics.service");
const github_actions_metrics_service_1 = require("./github-actions-metrics.service");
const log_sanitizer_service_1 = require("./log-sanitizer.service");
const observability_controller_1 = require("./observability.controller");
const observability_service_1 = require("./observability.service");
const pipeline_metrics_service_1 = require("./pipeline-metrics.service");
const project_log_stream_session_entity_1 = require("./project-log-stream-session.entity");
const project_observability_event_entity_1 = require("./project-observability-event.entity");
const project_pipeline_metric_summary_entity_1 = require("./project-pipeline-metric-summary.entity");
const project_runtime_metric_snapshot_entity_1 = require("./project-runtime-metric-snapshot.entity");
const project_stage_metric_entity_1 = require("./project-stage-metric.entity");
const prometheus_service_1 = require("./prometheus.service");
const sse_log_stream_service_1 = require("./sse-log-stream.service");
const trivy_metrics_service_1 = require("./trivy-metrics.service");
let ObservabilityModule = class ObservabilityModule {
};
exports.ObservabilityModule = ObservabilityModule;
exports.ObservabilityModule = ObservabilityModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                project_entity_1.Project,
                project_pipeline_run_entity_1.ProjectPipelineRun,
                project_pipeline_event_entity_1.ProjectPipelineEvent,
                project_security_scan_entity_1.ProjectSecurityScan,
                project_security_finding_entity_1.ProjectSecurityFinding,
                project_deployment_entity_1.ProjectDeployment,
                project_orchestration_event_entity_1.ProjectOrchestrationEvent,
                project_stage_metric_entity_1.ProjectStageMetric,
                project_pipeline_metric_summary_entity_1.ProjectPipelineMetricSummary,
                project_runtime_metric_snapshot_entity_1.ProjectRuntimeMetricSnapshot,
                project_log_stream_session_entity_1.ProjectLogStreamSession,
                project_observability_event_entity_1.ProjectObservabilityEvent,
            ]),
            audit_log_module_1.AuditLogModule,
        ],
        controllers: [observability_controller_1.ObservabilityController],
        providers: [
            observability_service_1.ObservabilityService,
            pipeline_metrics_service_1.PipelineMetricsService,
            github_actions_metrics_service_1.GithubActionsMetricsService,
            trivy_metrics_service_1.TrivyMetricsService,
            cloudwatch_logs_service_1.CloudWatchLogsService,
            cloudwatch_metrics_service_1.CloudWatchMetricsService,
            prometheus_service_1.PrometheusService,
            log_sanitizer_service_1.LogSanitizerService,
            sse_log_stream_service_1.SseLogStreamService,
            alb_service_1.AlbService,
        ],
        exports: [
            observability_service_1.ObservabilityService,
            pipeline_metrics_service_1.PipelineMetricsService,
            github_actions_metrics_service_1.GithubActionsMetricsService,
            trivy_metrics_service_1.TrivyMetricsService,
            cloudwatch_logs_service_1.CloudWatchLogsService,
            cloudwatch_metrics_service_1.CloudWatchMetricsService,
            prometheus_service_1.PrometheusService,
            log_sanitizer_service_1.LogSanitizerService,
        ],
    })
], ObservabilityModule);
//# sourceMappingURL=observability.module.js.map