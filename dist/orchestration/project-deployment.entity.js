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
exports.ProjectDeployment = exports.ProjectDeploymentStatus = void 0;
const typeorm_1 = require("typeorm");
const project_infrastructure_environment_entity_1 = require("../infrastructure/project-infrastructure-environment.entity");
const project_pipeline_run_entity_1 = require("../projects/project-pipeline-run.entity");
const project_entity_1 = require("../projects/project.entity");
var ProjectDeploymentStatus;
(function (ProjectDeploymentStatus) {
    ProjectDeploymentStatus["QUEUED"] = "queued";
    ProjectDeploymentStatus["DEPLOYING"] = "deploying";
    ProjectDeploymentStatus["WAITING_FOR_SERVICE_STABILITY"] = "waiting_for_service_stability";
    ProjectDeploymentStatus["HEALTHY"] = "healthy";
    ProjectDeploymentStatus["UNHEALTHY"] = "unhealthy";
    ProjectDeploymentStatus["FAILED"] = "failed";
    ProjectDeploymentStatus["ROLLBACK_STARTED"] = "rollback_started";
    ProjectDeploymentStatus["ROLLBACK_SUCCEEDED"] = "rollback_succeeded";
    ProjectDeploymentStatus["ROLLBACK_FAILED"] = "rollback_failed";
    ProjectDeploymentStatus["INTERRUPTED"] = "interrupted";
    ProjectDeploymentStatus["SCALED"] = "scaled";
})(ProjectDeploymentStatus || (exports.ProjectDeploymentStatus = ProjectDeploymentStatus = {}));
let ProjectDeployment = class ProjectDeployment {
};
exports.ProjectDeployment = ProjectDeployment;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)("uuid"),
    __metadata("design:type", String)
], ProjectDeployment.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.Column)({ name: "project_id" }),
    __metadata("design:type", String)
], ProjectDeployment.prototype, "projectId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => project_entity_1.Project, { nullable: false, onDelete: "CASCADE" }),
    (0, typeorm_1.JoinColumn)({ name: "project_id" }),
    __metadata("design:type", project_entity_1.Project)
], ProjectDeployment.prototype, "project", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, name: "pipeline_run_id" }),
    __metadata("design:type", String)
], ProjectDeployment.prototype, "pipelineRunId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => project_pipeline_run_entity_1.ProjectPipelineRun, { nullable: true, onDelete: "SET NULL" }),
    (0, typeorm_1.JoinColumn)({ name: "pipeline_run_id" }),
    __metadata("design:type", project_pipeline_run_entity_1.ProjectPipelineRun)
], ProjectDeployment.prototype, "pipelineRun", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, name: "infrastructure_environment_id" }),
    __metadata("design:type", String)
], ProjectDeployment.prototype, "infrastructureEnvironmentId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => project_infrastructure_environment_entity_1.ProjectInfrastructureEnvironment, { nullable: true, onDelete: "SET NULL" }),
    (0, typeorm_1.JoinColumn)({ name: "infrastructure_environment_id" }),
    __metadata("design:type", project_infrastructure_environment_entity_1.ProjectInfrastructureEnvironment)
], ProjectDeployment.prototype, "infrastructureEnvironment", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: "dev", name: "environment_name" }),
    __metadata("design:type", String)
], ProjectDeployment.prototype, "environmentName", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: ProjectDeploymentStatus.QUEUED }),
    __metadata("design:type", String)
], ProjectDeployment.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, name: "commit_sha" }),
    __metadata("design:type", String)
], ProjectDeployment.prototype, "commitSha", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, name: "short_commit_sha" }),
    __metadata("design:type", String)
], ProjectDeployment.prototype, "shortCommitSha", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, name: "image_uri" }),
    __metadata("design:type", String)
], ProjectDeployment.prototype, "imageUri", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, name: "task_definition_arn" }),
    __metadata("design:type", String)
], ProjectDeployment.prototype, "taskDefinitionArn", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, name: "previous_task_definition_arn" }),
    __metadata("design:type", String)
], ProjectDeployment.prototype, "previousTaskDefinitionArn", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, name: "ecs_cluster_arn" }),
    __metadata("design:type", String)
], ProjectDeployment.prototype, "ecsClusterArn", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, name: "ecs_cluster_name" }),
    __metadata("design:type", String)
], ProjectDeployment.prototype, "ecsClusterName", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, name: "ecs_service_arn" }),
    __metadata("design:type", String)
], ProjectDeployment.prototype, "ecsServiceArn", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, name: "ecs_service_name" }),
    __metadata("design:type", String)
], ProjectDeployment.prototype, "ecsServiceName", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, name: "alb_arn" }),
    __metadata("design:type", String)
], ProjectDeployment.prototype, "albArn", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, name: "alb_dns_name" }),
    __metadata("design:type", String)
], ProjectDeployment.prototype, "albDnsName", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, name: "target_group_arn" }),
    __metadata("design:type", String)
], ProjectDeployment.prototype, "targetGroupArn", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, name: "listener_arn" }),
    __metadata("design:type", String)
], ProjectDeployment.prototype, "listenerArn", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: "/health", name: "health_check_path" }),
    __metadata("design:type", String)
], ProjectDeployment.prototype, "healthCheckPath", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, name: "app_port" }),
    __metadata("design:type", Number)
], ProjectDeployment.prototype, "appPort", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 1, name: "desired_count" }),
    __metadata("design:type", Number)
], ProjectDeployment.prototype, "desiredCount", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 1, name: "min_tasks" }),
    __metadata("design:type", Number)
], ProjectDeployment.prototype, "minTasks", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 3, name: "max_tasks" }),
    __metadata("design:type", Number)
], ProjectDeployment.prototype, "maxTasks", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 60, name: "cpu_target_percent" }),
    __metadata("design:type", Number)
], ProjectDeployment.prototype, "cpuTargetPercent", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, name: "capacity_provider_strategy", type: "jsonb" }),
    __metadata("design:type", Array)
], ProjectDeployment.prototype, "capacityProviderStrategy", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, name: "efs_mount_config", type: "jsonb" }),
    __metadata("design:type", Object)
], ProjectDeployment.prototype, "efsMountConfig", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, name: "cloud_map_namespace_id" }),
    __metadata("design:type", String)
], ProjectDeployment.prototype, "cloudMapNamespaceId", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, name: "cloud_map_service_name" }),
    __metadata("design:type", String)
], ProjectDeployment.prototype, "cloudMapServiceName", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, name: "deployment_started_at", type: "timestamp" }),
    __metadata("design:type", Date)
], ProjectDeployment.prototype, "deploymentStartedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, name: "deployment_completed_at", type: "timestamp" }),
    __metadata("design:type", Date)
], ProjectDeployment.prototype, "deploymentCompletedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, name: "failed_at", type: "timestamp" }),
    __metadata("design:type", Date)
], ProjectDeployment.prototype, "failedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, name: "rollback_started_at", type: "timestamp" }),
    __metadata("design:type", Date)
], ProjectDeployment.prototype, "rollbackStartedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, name: "rollback_completed_at", type: "timestamp" }),
    __metadata("design:type", Date)
], ProjectDeployment.prototype, "rollbackCompletedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], ProjectDeployment.prototype, "stable", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, type: "jsonb" }),
    __metadata("design:type", Object)
], ProjectDeployment.prototype, "metadata", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, name: "error_message", type: "text" }),
    __metadata("design:type", String)
], ProjectDeployment.prototype, "errorMessage", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: "created_at" }),
    __metadata("design:type", Date)
], ProjectDeployment.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: "updated_at" }),
    __metadata("design:type", Date)
], ProjectDeployment.prototype, "updatedAt", void 0);
exports.ProjectDeployment = ProjectDeployment = __decorate([
    (0, typeorm_1.Entity)("project_deployments")
], ProjectDeployment);
//# sourceMappingURL=project-deployment.entity.js.map