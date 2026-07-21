"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const fs_1 = require("fs");
const path_1 = require("path");
const typeorm_1 = require("typeorm");
const audit_log_entity_1 = require("./audit-log/audit-log.entity");
const project_cost_estimate_entity_1 = require("./finops/project-cost-estimate.entity");
const project_cost_resource_breakdown_entity_1 = require("./finops/project-cost-resource-breakdown.entity");
const project_cost_settings_entity_1 = require("./finops/project-cost-settings.entity");
const project_deployment_readiness_snapshot_entity_1 = require("./infrastructure/project-deployment-readiness-snapshot.entity");
const project_infrastructure_environment_entity_1 = require("./infrastructure/project-infrastructure-environment.entity");
const project_infrastructure_event_entity_1 = require("./infrastructure/project-infrastructure-event.entity");
const project_service_discovery_record_entity_1 = require("./infrastructure/project-service-discovery-record.entity");
const project_deployment_entity_1 = require("./orchestration/project-deployment.entity");
const project_orchestration_event_entity_1 = require("./orchestration/project-orchestration-event.entity");
const project_rollback_record_entity_1 = require("./orchestration/project-rollback-record.entity");
const project_spot_interruption_event_entity_1 = require("./orchestration/project-spot-interruption-event.entity");
const project_stable_release_entity_1 = require("./orchestration/project-stable-release.entity");
const project_log_stream_session_entity_1 = require("./observability/project-log-stream-session.entity");
const project_observability_event_entity_1 = require("./observability/project-observability-event.entity");
const project_pipeline_metric_summary_entity_1 = require("./observability/project-pipeline-metric-summary.entity");
const project_runtime_metric_snapshot_entity_1 = require("./observability/project-runtime-metric-snapshot.entity");
const project_stage_metric_entity_1 = require("./observability/project-stage-metric.entity");
const project_deployment_queue_item_entity_1 = require("./state-management/project-deployment-queue-item.entity");
const project_state_recovery_request_entity_1 = require("./state-management/project-state-recovery-request.entity");
const project_state_validation_result_entity_1 = require("./state-management/project-state-validation-result.entity");
const project_terraform_lock_entity_1 = require("./state-management/project-terraform-lock.entity");
const project_terraform_state_entity_1 = require("./state-management/project-terraform-state.entity");
const project_backup_record_entity_1 = require("./storage/project-backup-record.entity");
const project_persistent_storage_entity_1 = require("./storage/project-persistent-storage.entity");
const project_storage_event_entity_1 = require("./storage/project-storage-event.entity");
const project_storage_restore_request_entity_1 = require("./storage/project-storage-restore-request.entity");
const project_detection_profile_entity_1 = require("./projects/project-detection-profile.entity");
const project_environment_variable_entity_1 = require("./projects/project-environment-variable.entity");
const project_pipeline_event_entity_1 = require("./projects/project-pipeline-event.entity");
const project_pipeline_run_entity_1 = require("./projects/project-pipeline-run.entity");
const project_preflight_report_entity_1 = require("./projects/project-preflight-report.entity");
const project_security_finding_entity_1 = require("./projects/project-security-finding.entity");
const project_security_scan_entity_1 = require("./projects/project-security-scan.entity");
const project_entity_1 = require("./projects/project.entity");
const user_entity_1 = require("./users/user.entity");
function loadBackendEnv() {
    const envPath = (0, path_1.resolve)(__dirname, "..", ".env");
    if (!(0, fs_1.existsSync)(envPath)) {
        return;
    }
    const envFile = (0, fs_1.readFileSync)(envPath, "utf8");
    for (const line of envFile.split(/\r?\n/)) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("#")) {
            continue;
        }
        const separatorIndex = trimmed.indexOf("=");
        if (separatorIndex === -1) {
            continue;
        }
        const key = trimmed.slice(0, separatorIndex).trim();
        const rawValue = trimmed.slice(separatorIndex + 1).trim();
        const value = rawValue.replace(/^["']|["']$/g, "");
        if (key && process.env[key] === undefined) {
            process.env[key] = value;
        }
    }
}
function getDatabasePort() {
    const value = process.env.DATABASE_PORT || process.env.DB_PORT || "5433";
    const port = Number(value);
    if (!Number.isInteger(port) || port <= 0) {
        throw new Error("Invalid database port configuration");
    }
    return port;
}
loadBackendEnv();
exports.default = new typeorm_1.DataSource({
    type: "postgres",
    host: process.env.DATABASE_HOST || process.env.DB_HOST || "localhost",
    port: getDatabasePort(),
    username: process.env.DATABASE_USERNAME || process.env.DB_USERNAME || "mini_paas_user",
    password: process.env.DATABASE_PASSWORD || process.env.DB_PASSWORD || "mini_paas_password",
    database: process.env.DATABASE_NAME || process.env.DB_NAME || "mini_paas",
    ssl: process.env.DATABASE_SSL === "true" ? { rejectUnauthorized: false } : false,
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
    migrations: ["src/migrations/*.ts"],
});
//# sourceMappingURL=data-source.js.map