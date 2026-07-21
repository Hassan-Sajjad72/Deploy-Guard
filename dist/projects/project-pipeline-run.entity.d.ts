import { User } from "../users/user.entity";
import { ProjectDetectionProfile } from "./project-detection-profile.entity";
import { ProjectPreflightReport } from "./project-preflight-report.entity";
import { Project } from "./project.entity";
import { ProjectPipelineEvent } from "./project-pipeline-event.entity";
export declare enum PipelineRunStatus {
    QUEUED = "queued",
    RUNNING = "running",
    COST_ANALYSIS_RUNNING = "cost_analysis_running",
    WAITING_FOR_COST_APPROVAL = "waiting_for_cost_approval",
    BLOCKED_BY_COST_LIMIT = "blocked_by_cost_limit",
    COST_REJECTED = "cost_rejected",
    COST_ANALYSIS_FAILED = "cost_analysis_failed",
    STATE_LOCK_ACQUIRING = "state_lock_acquiring",
    WAITING_FOR_STATE_LOCK = "waiting_for_state_lock",
    STATE_LOCK_ACQUIRED = "state_lock_acquired",
    STATE_HEARTBEAT_ACTIVE = "state_heartbeat_active",
    STATE_VALIDATION_RUNNING = "state_validation_running",
    STATE_RECOVERY_REQUIRED = "state_recovery_required",
    STATE_LOCK_RELEASED = "state_lock_released",
    STATE_LOCK_FAILED = "state_lock_failed",
    STORAGE_EVALUATION_RUNNING = "storage_evaluation_running",
    STORAGE_NOT_REQUIRED = "storage_not_required",
    STORAGE_PROVISIONING = "storage_provisioning",
    STORAGE_PROVISIONED = "storage_provisioned",
    STORAGE_FAILED = "storage_failed",
    BACKUP_CONFIGURING = "backup_configuring",
    BACKUP_CONFIGURED = "backup_configured",
    BACKUP_FAILED = "backup_failed",
    ECS_DEPLOYMENT_QUEUED = "ecs_deployment_queued",
    ECS_TASK_DEFINITION_REGISTERING = "ecs_task_definition_registering",
    ECS_SERVICE_UPDATING = "ecs_service_updating",
    ECS_WAITING_FOR_STABILITY = "ecs_waiting_for_stability",
    ECS_SERVICE_HEALTHY = "ecs_service_healthy",
    ECS_SERVICE_UNHEALTHY = "ecs_service_unhealthy",
    ECS_DEPLOYMENT_FAILED = "ecs_deployment_failed",
    ROLLBACK_STARTED = "rollback_started",
    ROLLBACK_SUCCEEDED = "rollback_succeeded",
    ROLLBACK_FAILED = "rollback_failed",
    SPOT_INTERRUPTION_HANDLED = "spot_interruption_handled",
    COMPLETED = "completed",
    FAILED = "failed",
    CANCELLED = "cancelled"
}
export declare class ProjectPipelineRun {
    id: string;
    projectId: string;
    project: Project;
    triggeredByUserId: number;
    triggeredByUser: User;
    preflightReportId: string;
    preflightReport: ProjectPreflightReport;
    detectionProfileId: string;
    detectionProfile: ProjectDetectionProfile;
    repositoryUrl: string;
    repositoryFullName: string;
    targetBranch: string;
    commitSha: string;
    imageName: string;
    imageTag: string;
    ecrRepositoryName: string;
    ecrImageUri: string;
    githubWorkflowRunId: string;
    githubWorkflowStatus: string;
    status: PipelineRunStatus;
    currentStage: string;
    startedAt: Date;
    completedAt: Date;
    failedAt: Date;
    errorMessage: string;
    metadata: Record<string, unknown> | null;
    events: ProjectPipelineEvent[];
    createdAt: Date;
    updatedAt: Date;
}
