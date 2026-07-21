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
exports.ProjectStageMetric = exports.StageMetricSource = exports.StageMetricStatus = void 0;
const typeorm_1 = require("typeorm");
const project_deployment_entity_1 = require("../orchestration/project-deployment.entity");
const project_pipeline_run_entity_1 = require("../projects/project-pipeline-run.entity");
const project_entity_1 = require("../projects/project.entity");
var StageMetricStatus;
(function (StageMetricStatus) {
    StageMetricStatus["PENDING"] = "pending";
    StageMetricStatus["RUNNING"] = "running";
    StageMetricStatus["SUCCEEDED"] = "succeeded";
    StageMetricStatus["FAILED"] = "failed";
    StageMetricStatus["SKIPPED"] = "skipped";
    StageMetricStatus["CANCELLED"] = "cancelled";
})(StageMetricStatus || (exports.StageMetricStatus = StageMetricStatus = {}));
var StageMetricSource;
(function (StageMetricSource) {
    StageMetricSource["PIPELINE"] = "pipeline";
    StageMetricSource["GITHUB_ACTIONS"] = "github_actions";
    StageMetricSource["TRIVY"] = "trivy";
    StageMetricSource["DOCKER"] = "docker";
    StageMetricSource["ECR"] = "ecr";
    StageMetricSource["TERRAFORM"] = "terraform";
    StageMetricSource["FINOPS"] = "finops";
    StageMetricSource["ECS"] = "ecs";
    StageMetricSource["ALB"] = "alb";
    StageMetricSource["ROLLBACK"] = "rollback";
    StageMetricSource["MANUAL"] = "manual";
})(StageMetricSource || (exports.StageMetricSource = StageMetricSource = {}));
let ProjectStageMetric = class ProjectStageMetric {
};
exports.ProjectStageMetric = ProjectStageMetric;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)("uuid"),
    __metadata("design:type", String)
], ProjectStageMetric.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.Column)({ name: "project_id" }),
    __metadata("design:type", String)
], ProjectStageMetric.prototype, "projectId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => project_entity_1.Project, { nullable: false, onDelete: "CASCADE" }),
    (0, typeorm_1.JoinColumn)({ name: "project_id" }),
    __metadata("design:type", project_entity_1.Project)
], ProjectStageMetric.prototype, "project", void 0);
__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.Column)({ nullable: true, name: "pipeline_run_id" }),
    __metadata("design:type", String)
], ProjectStageMetric.prototype, "pipelineRunId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => project_pipeline_run_entity_1.ProjectPipelineRun, { nullable: true, onDelete: "SET NULL" }),
    (0, typeorm_1.JoinColumn)({ name: "pipeline_run_id" }),
    __metadata("design:type", project_pipeline_run_entity_1.ProjectPipelineRun)
], ProjectStageMetric.prototype, "pipelineRun", void 0);
__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.Column)({ nullable: true, name: "deployment_id" }),
    __metadata("design:type", String)
], ProjectStageMetric.prototype, "deploymentId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => project_deployment_entity_1.ProjectDeployment, { nullable: true, onDelete: "SET NULL" }),
    (0, typeorm_1.JoinColumn)({ name: "deployment_id" }),
    __metadata("design:type", project_deployment_entity_1.ProjectDeployment)
], ProjectStageMetric.prototype, "deployment", void 0);
__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.Column)({ name: "stage_name" }),
    __metadata("design:type", String)
], ProjectStageMetric.prototype, "stageName", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: StageMetricStatus.PENDING }),
    __metadata("design:type", String)
], ProjectStageMetric.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, name: "started_at", type: "timestamp" }),
    __metadata("design:type", Date)
], ProjectStageMetric.prototype, "startedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, name: "ended_at", type: "timestamp" }),
    __metadata("design:type", Date)
], ProjectStageMetric.prototype, "endedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, name: "duration_ms" }),
    __metadata("design:type", Number)
], ProjectStageMetric.prototype, "durationMs", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: StageMetricSource.PIPELINE }),
    __metadata("design:type", String)
], ProjectStageMetric.prototype, "source", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, type: "jsonb" }),
    __metadata("design:type", Object)
], ProjectStageMetric.prototype, "metadata", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: "created_at" }),
    __metadata("design:type", Date)
], ProjectStageMetric.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: "updated_at" }),
    __metadata("design:type", Date)
], ProjectStageMetric.prototype, "updatedAt", void 0);
exports.ProjectStageMetric = ProjectStageMetric = __decorate([
    (0, typeorm_1.Entity)("project_stage_metrics")
], ProjectStageMetric);
//# sourceMappingURL=project-stage-metric.entity.js.map