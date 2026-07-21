"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const admin_module_1 = require("./admin/admin.module");
const audit_log_module_1 = require("./audit-log/audit-log.module");
const audit_log_entity_1 = require("./audit-log/audit-log.entity");
const auth_module_1 = require("./auth/auth.module");
const authenticated_user_middleware_1 = require("./common/middleware/authenticated-user.middleware");
const finops_module_1 = require("./finops/finops.module");
const project_cost_estimate_entity_1 = require("./finops/project-cost-estimate.entity");
const project_cost_resource_breakdown_entity_1 = require("./finops/project-cost-resource-breakdown.entity");
const project_cost_settings_entity_1 = require("./finops/project-cost-settings.entity");
const infrastructure_module_1 = require("./infrastructure/infrastructure.module");
const project_deployment_readiness_snapshot_entity_1 = require("./infrastructure/project-deployment-readiness-snapshot.entity");
const orchestration_module_1 = require("./orchestration/orchestration.module");
const observability_module_1 = require("./observability/observability.module");
const project_log_stream_session_entity_1 = require("./observability/project-log-stream-session.entity");
const project_observability_event_entity_1 = require("./observability/project-observability-event.entity");
const project_pipeline_metric_summary_entity_1 = require("./observability/project-pipeline-metric-summary.entity");
const project_runtime_metric_snapshot_entity_1 = require("./observability/project-runtime-metric-snapshot.entity");
const project_stage_metric_entity_1 = require("./observability/project-stage-metric.entity");
const project_deployment_entity_1 = require("./orchestration/project-deployment.entity");
const project_orchestration_event_entity_1 = require("./orchestration/project-orchestration-event.entity");
const project_rollback_record_entity_1 = require("./orchestration/project-rollback-record.entity");
const project_spot_interruption_event_entity_1 = require("./orchestration/project-spot-interruption-event.entity");
const project_stable_release_entity_1 = require("./orchestration/project-stable-release.entity");
const project_infrastructure_environment_entity_1 = require("./infrastructure/project-infrastructure-environment.entity");
const project_infrastructure_event_entity_1 = require("./infrastructure/project-infrastructure-event.entity");
const project_service_discovery_record_entity_1 = require("./infrastructure/project-service-discovery-record.entity");
const state_management_module_1 = require("./state-management/state-management.module");
const project_deployment_queue_item_entity_1 = require("./state-management/project-deployment-queue-item.entity");
const project_state_recovery_request_entity_1 = require("./state-management/project-state-recovery-request.entity");
const project_state_validation_result_entity_1 = require("./state-management/project-state-validation-result.entity");
const project_terraform_lock_entity_1 = require("./state-management/project-terraform-lock.entity");
const project_terraform_state_entity_1 = require("./state-management/project-terraform-state.entity");
const storage_module_1 = require("./storage/storage.module");
const project_backup_record_entity_1 = require("./storage/project-backup-record.entity");
const project_persistent_storage_entity_1 = require("./storage/project-persistent-storage.entity");
const project_storage_event_entity_1 = require("./storage/project-storage-event.entity");
const project_storage_restore_request_entity_1 = require("./storage/project-storage-restore-request.entity");
const project_environment_variable_entity_1 = require("./projects/project-environment-variable.entity");
const project_detection_profile_entity_1 = require("./projects/project-detection-profile.entity");
const project_preflight_report_entity_1 = require("./projects/project-preflight-report.entity");
const project_pipeline_event_entity_1 = require("./projects/project-pipeline-event.entity");
const project_pipeline_run_entity_1 = require("./projects/project-pipeline-run.entity");
const project_security_finding_entity_1 = require("./projects/project-security-finding.entity");
const project_security_scan_entity_1 = require("./projects/project-security-scan.entity");
const project_entity_1 = require("./projects/project.entity");
const projects_module_1 = require("./projects/projects.module");
const users_module_1 = require("./users/users.module");
const user_entity_1 = require("./users/user.entity");
let AppModule = class AppModule {
    configure(consumer) {
        consumer.apply(authenticated_user_middleware_1.AuthenticatedUserMiddleware).forRoutes({ path: "api/admin/users", method: common_1.RequestMethod.ALL }, { path: "api/admin/users/:userId/role", method: common_1.RequestMethod.ALL }, { path: "api/audit-logs", method: common_1.RequestMethod.ALL }, { path: "api/auth/me", method: common_1.RequestMethod.ALL }, { path: "auth/me", method: common_1.RequestMethod.ALL }, { path: "api/projects", method: common_1.RequestMethod.ALL }, { path: "api/projects/:projectId", method: common_1.RequestMethod.ALL }, { path: "api/projects/:projectId/detect-stack", method: common_1.RequestMethod.ALL }, {
            path: "api/projects/:projectId/detection-profile",
            method: common_1.RequestMethod.ALL,
        }, { path: "api/projects/:projectId/preflight", method: common_1.RequestMethod.ALL }, { path: "api/projects/:projectId/pipeline/runs", method: common_1.RequestMethod.ALL }, {
            path: "api/projects/:projectId/pipeline/runs/:runId",
            method: common_1.RequestMethod.ALL,
        }, {
            path: "api/projects/:projectId/pipeline/runs/:runId/events",
            method: common_1.RequestMethod.ALL,
        }, { path: "api/projects/:projectId/security-scans", method: common_1.RequestMethod.ALL }, {
            path: "api/projects/:projectId/security-scans/:scanId",
            method: common_1.RequestMethod.ALL,
        }, {
            path: "api/projects/:projectId/security-scans/:scanId/findings",
            method: common_1.RequestMethod.ALL,
        }, {
            path: "api/projects/:projectId/security-scans/:scanId/approve",
            method: common_1.RequestMethod.ALL,
        }, { path: "api/projects/:projectId/cost-estimates", method: common_1.RequestMethod.ALL }, {
            path: "api/projects/:projectId/cost-estimates/latest",
            method: common_1.RequestMethod.ALL,
        }, {
            path: "api/projects/:projectId/cost-estimates/:estimateId",
            method: common_1.RequestMethod.ALL,
        }, {
            path: "api/projects/:projectId/cost-estimates/:estimateId/approve",
            method: common_1.RequestMethod.ALL,
        }, {
            path: "api/projects/:projectId/cost-estimates/:estimateId/reject",
            method: common_1.RequestMethod.ALL,
        }, { path: "api/projects/:projectId/cost-settings", method: common_1.RequestMethod.ALL }, {
            path: "api/projects/:projectId/deployment-readiness",
            method: common_1.RequestMethod.ALL,
        }, { path: "api/projects/:projectId/deploy", method: common_1.RequestMethod.ALL }, { path: "api/projects/:projectId/infrastructure", method: common_1.RequestMethod.ALL }, {
            path: "api/projects/:projectId/infrastructure/plan",
            method: common_1.RequestMethod.ALL,
        }, {
            path: "api/projects/:projectId/infrastructure/apply",
            method: common_1.RequestMethod.ALL,
        }, {
            path: "api/projects/:projectId/infrastructure/events",
            method: common_1.RequestMethod.ALL,
        }, {
            path: "api/projects/:projectId/service-discovery",
            method: common_1.RequestMethod.ALL,
        }, { path: "api/projects/:projectId/state", method: common_1.RequestMethod.ALL }, { path: "api/projects/:projectId/state/versions", method: common_1.RequestMethod.ALL }, { path: "api/projects/:projectId/state/locks", method: common_1.RequestMethod.ALL }, {
            path: "api/projects/:projectId/state/locks/:lockId/force-release",
            method: common_1.RequestMethod.ALL,
        }, { path: "api/projects/:projectId/state/validation", method: common_1.RequestMethod.ALL }, { path: "api/projects/:projectId/state/validate", method: common_1.RequestMethod.ALL }, { path: "api/projects/:projectId/state/recover", method: common_1.RequestMethod.ALL }, { path: "api/projects/:projectId/storage", method: common_1.RequestMethod.ALL }, {
            path: "api/projects/:projectId/storage/recommendation",
            method: common_1.RequestMethod.ALL,
        }, {
            path: "api/projects/:projectId/storage/settings",
            method: common_1.RequestMethod.ALL,
        }, {
            path: "api/projects/:projectId/storage/provision",
            method: common_1.RequestMethod.ALL,
        }, {
            path: "api/projects/:projectId/storage/events",
            method: common_1.RequestMethod.ALL,
        }, {
            path: "api/projects/:projectId/storage/mount-config",
            method: common_1.RequestMethod.ALL,
        }, { path: "api/projects/:projectId/backups", method: common_1.RequestMethod.ALL }, {
            path: "api/projects/:projectId/backups/restore-request",
            method: common_1.RequestMethod.ALL,
        }, {
            path: "api/projects/:projectId/orchestration",
            method: common_1.RequestMethod.ALL,
        }, {
            path: "api/projects/:projectId/orchestration/status",
            method: common_1.RequestMethod.ALL,
        }, {
            path: "api/projects/:projectId/orchestration/events",
            method: common_1.RequestMethod.ALL,
        }, {
            path: "api/projects/:projectId/orchestration/releases",
            method: common_1.RequestMethod.ALL,
        }, {
            path: "api/projects/:projectId/orchestration/deploy",
            method: common_1.RequestMethod.ALL,
        }, {
            path: "api/projects/:projectId/orchestration/rollback",
            method: common_1.RequestMethod.ALL,
        }, {
            path: "api/projects/:projectId/orchestration/target-health",
            method: common_1.RequestMethod.ALL,
        }, {
            path: "api/projects/:projectId/orchestration/scaling",
            method: common_1.RequestMethod.ALL,
        }, {
            path: "api/projects/:projectId/observability",
            method: common_1.RequestMethod.ALL,
        }, {
            path: "api/projects/:projectId/observability/summary",
            method: common_1.RequestMethod.ALL,
        }, {
            path: "api/projects/:projectId/observability/pipeline-metrics",
            method: common_1.RequestMethod.ALL,
        }, {
            path: "api/projects/:projectId/observability/runtime-metrics",
            method: common_1.RequestMethod.ALL,
        }, {
            path: "api/projects/:projectId/observability/logs",
            method: common_1.RequestMethod.ALL,
        }, {
            path: "api/projects/:projectId/observability/logs/stream",
            method: common_1.RequestMethod.ALL,
        }, {
            path: "api/projects/:projectId/observability/health",
            method: common_1.RequestMethod.ALL,
        }, { path: "api/projects/:projectId/repository", method: common_1.RequestMethod.ALL }, { path: "api/projects/:projectId/branches", method: common_1.RequestMethod.ALL }, { path: "api/projects/:projectId/branch", method: common_1.RequestMethod.ALL }, { path: "api/projects/:projectId/env", method: common_1.RequestMethod.ALL }, { path: "api/projects/:projectId/env/:envId", method: common_1.RequestMethod.ALL }, { path: "api/templates", method: common_1.RequestMethod.ALL });
    }
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                envFilePath: ".env",
            }),
            typeorm_1.TypeOrmModule.forRootAsync({
                imports: [config_1.ConfigModule],
                inject: [config_1.ConfigService],
                useFactory: (config) => ({
                    type: "postgres",
                    host: config.get("DATABASE_HOST", config.get("DB_HOST", "localhost")),
                    port: Number(config.get("DATABASE_PORT", config.get("DB_PORT", "5432"))),
                    username: config.get("DATABASE_USERNAME", config.get("DB_USERNAME", "mini_paas_user")),
                    password: config.get("DATABASE_PASSWORD", config.get("DB_PASSWORD", "mini_paas_password")),
                    database: config.get("DATABASE_NAME", config.get("DB_NAME", "mini_paas")),
                    entities: [
                        user_entity_1.User,
                        audit_log_entity_1.AuditLog,
                        project_entity_1.Project,
                        project_environment_variable_entity_1.ProjectEnvironmentVariable,
                        project_detection_profile_entity_1.ProjectDetectionProfile,
                        project_preflight_report_entity_1.ProjectPreflightReport,
                        project_pipeline_run_entity_1.ProjectPipelineRun,
                        project_pipeline_event_entity_1.ProjectPipelineEvent,
                        project_security_scan_entity_1.ProjectSecurityScan,
                        project_security_finding_entity_1.ProjectSecurityFinding,
                        project_cost_estimate_entity_1.ProjectCostEstimate,
                        project_cost_resource_breakdown_entity_1.ProjectCostResourceBreakdown,
                        project_cost_settings_entity_1.ProjectCostSettings,
                        project_infrastructure_environment_entity_1.ProjectInfrastructureEnvironment,
                        project_infrastructure_event_entity_1.ProjectInfrastructureEvent,
                        project_service_discovery_record_entity_1.ProjectServiceDiscoveryRecord,
                        project_deployment_readiness_snapshot_entity_1.ProjectDeploymentReadinessSnapshot,
                        project_terraform_state_entity_1.ProjectTerraformState,
                        project_terraform_lock_entity_1.ProjectTerraformLock,
                        project_deployment_queue_item_entity_1.ProjectDeploymentQueueItem,
                        project_state_validation_result_entity_1.ProjectStateValidationResult,
                        project_state_recovery_request_entity_1.ProjectStateRecoveryRequest,
                        project_persistent_storage_entity_1.ProjectPersistentStorage,
                        project_storage_event_entity_1.ProjectStorageEvent,
                        project_backup_record_entity_1.ProjectBackupRecord,
                        project_storage_restore_request_entity_1.ProjectStorageRestoreRequest,
                        project_deployment_entity_1.ProjectDeployment,
                        project_stable_release_entity_1.ProjectStableRelease,
                        project_orchestration_event_entity_1.ProjectOrchestrationEvent,
                        project_spot_interruption_event_entity_1.ProjectSpotInterruptionEvent,
                        project_rollback_record_entity_1.ProjectRollbackRecord,
                        project_stage_metric_entity_1.ProjectStageMetric,
                        project_pipeline_metric_summary_entity_1.ProjectPipelineMetricSummary,
                        project_runtime_metric_snapshot_entity_1.ProjectRuntimeMetricSnapshot,
                        project_log_stream_session_entity_1.ProjectLogStreamSession,
                        project_observability_event_entity_1.ProjectObservabilityEvent,
                    ],
                    synchronize: true,
                    logging: ["error", "warn"],
                    ssl: config.get("DATABASE_SSL", "false") === "true"
                        ? { rejectUnauthorized: false }
                        : false,
                }),
            }),
            auth_module_1.AuthModule,
            users_module_1.UsersModule,
            admin_module_1.AdminModule,
            audit_log_module_1.AuditLogModule,
            projects_module_1.ProjectsModule,
            finops_module_1.FinopsModule,
            infrastructure_module_1.InfrastructureModule,
            state_management_module_1.StateManagementModule,
            storage_module_1.StorageModule,
            orchestration_module_1.OrchestrationModule,
            observability_module_1.ObservabilityModule,
        ],
        providers: [authenticated_user_middleware_1.AuthenticatedUserMiddleware],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map