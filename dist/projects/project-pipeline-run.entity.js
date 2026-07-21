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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectPipelineRun = exports.PipelineRunStatus = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("../users/user.entity");
const project_detection_profile_entity_1 = require("./project-detection-profile.entity");
const project_preflight_report_entity_1 = require("./project-preflight-report.entity");
const project_entity_1 = require("./project.entity");
const project_pipeline_event_entity_1 = require("./project-pipeline-event.entity");
var PipelineRunStatus;
(function (PipelineRunStatus) {
    PipelineRunStatus["QUEUED"] = "queued";
    PipelineRunStatus["RUNNING"] = "running";
    PipelineRunStatus["COST_ANALYSIS_RUNNING"] = "cost_analysis_running";
    PipelineRunStatus["WAITING_FOR_COST_APPROVAL"] = "waiting_for_cost_approval";
    PipelineRunStatus["BLOCKED_BY_COST_LIMIT"] = "blocked_by_cost_limit";
    PipelineRunStatus["COST_REJECTED"] = "cost_rejected";
    PipelineRunStatus["COST_ANALYSIS_FAILED"] = "cost_analysis_failed";
    PipelineRunStatus["STATE_LOCK_ACQUIRING"] = "state_lock_acquiring";
    PipelineRunStatus["WAITING_FOR_STATE_LOCK"] = "waiting_for_state_lock";
    PipelineRunStatus["STATE_LOCK_ACQUIRED"] = "state_lock_acquired";
    PipelineRunStatus["STATE_HEARTBEAT_ACTIVE"] = "state_heartbeat_active";
    PipelineRunStatus["STATE_VALIDATION_RUNNING"] = "state_validation_running";
    PipelineRunStatus["STATE_RECOVERY_REQUIRED"] = "state_recovery_required";
    PipelineRunStatus["STATE_LOCK_RELEASED"] = "state_lock_released";
    PipelineRunStatus["STATE_LOCK_FAILED"] = "state_lock_failed";
    PipelineRunStatus["STORAGE_EVALUATION_RUNNING"] = "storage_evaluation_running";
    PipelineRunStatus["STORAGE_NOT_REQUIRED"] = "storage_not_required";
    PipelineRunStatus["STORAGE_PROVISIONING"] = "storage_provisioning";
    PipelineRunStatus["STORAGE_PROVISIONED"] = "storage_provisioned";
    PipelineRunStatus["STORAGE_FAILED"] = "storage_failed";
    PipelineRunStatus["BACKUP_CONFIGURING"] = "backup_configuring";
    PipelineRunStatus["BACKUP_CONFIGURED"] = "backup_configured";
    PipelineRunStatus["BACKUP_FAILED"] = "backup_failed";
    PipelineRunStatus["ECS_DEPLOYMENT_QUEUED"] = "ecs_deployment_queued";
    PipelineRunStatus["ECS_TASK_DEFINITION_REGISTERING"] = "ecs_task_definition_registering";
    PipelineRunStatus["ECS_SERVICE_UPDATING"] = "ecs_service_updating";
    PipelineRunStatus["ECS_WAITING_FOR_STABILITY"] = "ecs_waiting_for_stability";
    PipelineRunStatus["ECS_SERVICE_HEALTHY"] = "ecs_service_healthy";
    PipelineRunStatus["ECS_SERVICE_UNHEALTHY"] = "ecs_service_unhealthy";
    PipelineRunStatus["ECS_DEPLOYMENT_FAILED"] = "ecs_deployment_failed";
    PipelineRunStatus["ROLLBACK_STARTED"] = "rollback_started";
    PipelineRunStatus["ROLLBACK_SUCCEEDED"] = "rollback_succeeded";
    PipelineRunStatus["ROLLBACK_FAILED"] = "rollback_failed";
    PipelineRunStatus["SPOT_INTERRUPTION_HANDLED"] = "spot_interruption_handled";
    PipelineRunStatus["COMPLETED"] = "completed";
    PipelineRunStatus["FAILED"] = "failed";
    PipelineRunStatus["CANCELLED"] = "cancelled";
})(PipelineRunStatus || (exports.PipelineRunStatus = PipelineRunStatus = {}));
let ProjectPipelineRun = class ProjectPipelineRun {
};
exports.ProjectPipelineRun = ProjectPipelineRun;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)("uuid"),
    __metadata("design:type", String)
], ProjectPipelineRun.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.Column)({ name: "project_id" }),
    __metadata("design:type", String)
], ProjectPipelineRun.prototype, "projectId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => project_entity_1.Project, { nullable: false, onDelete: "CASCADE" }),
    (0, typeorm_1.JoinColumn)({ name: "project_id" }),
    __metadata("design:type", project_entity_1.Project)
], ProjectPipelineRun.prototype, "project", void 0);
__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.Column)({ name: "triggered_by_user_id" }),
    __metadata("design:type", Number)
], ProjectPipelineRun.prototype, "triggeredByUserId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { nullable: false, onDelete: "CASCADE" }),
    (0, typeorm_1.JoinColumn)({ name: "triggered_by_user_id" }),
    __metadata("design:type", user_entity_1.User)
], ProjectPipelineRun.prototype, "triggeredByUser", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, name: "preflight_report_id" }),
    __metadata("design:type", String)
], ProjectPipelineRun.prototype, "preflightReportId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => project_preflight_report_entity_1.ProjectPreflightReport, { nullable: true, onDelete: "SET NULL" }),
    (0, typeorm_1.JoinColumn)({ name: "preflight_report_id" }),
    __metadata("design:type", project_preflight_report_entity_1.ProjectPreflightReport)
], ProjectPipelineRun.prototype, "preflightReport", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, name: "detection_profile_id" }),
    __metadata("design:type", String)
], ProjectPipelineRun.prototype, "detectionProfileId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => project_detection_profile_entity_1.ProjectDetectionProfile, { nullable: true, onDelete: "SET NULL" }),
    (0, typeorm_1.JoinColumn)({ name: "detection_profile_id" }),
    __metadata("design:type", project_detection_profile_entity_1.ProjectDetectionProfile)
], ProjectPipelineRun.prototype, "detectionProfile", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "repository_url" }),
    __metadata("design:type", String)
], ProjectPipelineRun.prototype, "repositoryUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, name: "repository_full_name" }),
    __metadata("design:type", String)
], ProjectPipelineRun.prototype, "repositoryFullName", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "target_branch" }),
    __metadata("design:type", String)
], ProjectPipelineRun.prototype, "targetBranch", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, name: "commit_sha" }),
    __metadata("design:type", String)
], ProjectPipelineRun.prototype, "commitSha", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, name: "image_name" }),
    __metadata("design:type", String)
], ProjectPipelineRun.prototype, "imageName", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, name: "image_tag" }),
    __metadata("design:type", String)
], ProjectPipelineRun.prototype, "imageTag", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, name: "ecr_repository_name" }),
    __metadata("design:type", String)
], ProjectPipelineRun.prototype, "ecrRepositoryName", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, name: "ecr_image_uri" }),
    __metadata("design:type", String)
], ProjectPipelineRun.prototype, "ecrImageUri", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, name: "github_workflow_run_id" }),
    __metadata("design:type", String)
], ProjectPipelineRun.prototype, "githubWorkflowRunId", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, name: "github_workflow_status" }),
    __metadata("design:type", String)
], ProjectPipelineRun.prototype, "githubWorkflowStatus", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "enum",
        enum: PipelineRunStatus,
        default: PipelineRunStatus.QUEUED,
    }),
    __metadata("design:type", String)
], ProjectPipelineRun.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, name: "current_stage" }),
    __metadata("design:type", String)
], ProjectPipelineRun.prototype, "currentStage", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, name: "started_at", type: "timestamp" }),
    __metadata("design:type", Date)
], ProjectPipelineRun.prototype, "startedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, name: "completed_at", type: "timestamp" }),
    __metadata("design:type", Date)
], ProjectPipelineRun.prototype, "completedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, name: "failed_at", type: "timestamp" }),
    __metadata("design:type", Date)
], ProjectPipelineRun.prototype, "failedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, name: "error_message", type: "text" }),
    __metadata("design:type", String)
], ProjectPipelineRun.prototype, "errorMessage", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, type: "jsonb" }),
    __metadata("design:type", Object)
], ProjectPipelineRun.prototype, "metadata", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => project_pipeline_event_entity_1.ProjectPipelineEvent, (event) => event.pipelineRun),
    __metadata("design:type", Array)
], ProjectPipelineRun.prototype, "events", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: "created_at" }),
    __metadata("design:type", Date)
], ProjectPipelineRun.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: "updated_at" }),
    __metadata("design:type", Date)
], ProjectPipelineRun.prototype, "updatedAt", void 0);
exports.ProjectPipelineRun = ProjectPipelineRun = __decorate([
    (0, typeorm_1.Entity)("project_pipeline_runs")
], ProjectPipelineRun);
//# sourceMappingURL=project-pipeline-run.entity.js.map