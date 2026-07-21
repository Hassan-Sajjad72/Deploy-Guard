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
exports.ProjectPipelineMetricSummary = void 0;
const typeorm_1 = require("typeorm");
const project_pipeline_run_entity_1 = require("../projects/project-pipeline-run.entity");
const project_entity_1 = require("../projects/project.entity");
let ProjectPipelineMetricSummary = class ProjectPipelineMetricSummary {
};
exports.ProjectPipelineMetricSummary = ProjectPipelineMetricSummary;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)("uuid"),
    __metadata("design:type", String)
], ProjectPipelineMetricSummary.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.Column)({ name: "project_id" }),
    __metadata("design:type", String)
], ProjectPipelineMetricSummary.prototype, "projectId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => project_entity_1.Project, { nullable: false, onDelete: "CASCADE" }),
    (0, typeorm_1.JoinColumn)({ name: "project_id" }),
    __metadata("design:type", project_entity_1.Project)
], ProjectPipelineMetricSummary.prototype, "project", void 0);
__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.Column)({ name: "pipeline_run_id" }),
    __metadata("design:type", String)
], ProjectPipelineMetricSummary.prototype, "pipelineRunId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => project_pipeline_run_entity_1.ProjectPipelineRun, { nullable: false, onDelete: "CASCADE" }),
    (0, typeorm_1.JoinColumn)({ name: "pipeline_run_id" }),
    __metadata("design:type", project_pipeline_run_entity_1.ProjectPipelineRun)
], ProjectPipelineMetricSummary.prototype, "pipelineRun", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, name: "total_duration_ms" }),
    __metadata("design:type", Number)
], ProjectPipelineMetricSummary.prototype, "totalDurationMs", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, name: "github_actions_duration_ms" }),
    __metadata("design:type", Number)
], ProjectPipelineMetricSummary.prototype, "githubActionsDurationMs", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, name: "docker_build_duration_ms" }),
    __metadata("design:type", Number)
], ProjectPipelineMetricSummary.prototype, "dockerBuildDurationMs", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, name: "trivy_scan_duration_ms" }),
    __metadata("design:type", Number)
], ProjectPipelineMetricSummary.prototype, "trivyScanDurationMs", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, name: "ecr_push_duration_ms" }),
    __metadata("design:type", Number)
], ProjectPipelineMetricSummary.prototype, "ecrPushDurationMs", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, name: "terraform_plan_duration_ms" }),
    __metadata("design:type", Number)
], ProjectPipelineMetricSummary.prototype, "terraformPlanDurationMs", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, name: "terraform_apply_duration_ms" }),
    __metadata("design:type", Number)
], ProjectPipelineMetricSummary.prototype, "terraformApplyDurationMs", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, name: "finops_duration_ms" }),
    __metadata("design:type", Number)
], ProjectPipelineMetricSummary.prototype, "finopsDurationMs", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, name: "ecs_deployment_duration_ms" }),
    __metadata("design:type", Number)
], ProjectPipelineMetricSummary.prototype, "ecsDeploymentDurationMs", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, name: "alb_health_check_duration_ms" }),
    __metadata("design:type", Number)
], ProjectPipelineMetricSummary.prototype, "albHealthCheckDurationMs", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, name: "rollback_duration_ms" }),
    __metadata("design:type", Number)
], ProjectPipelineMetricSummary.prototype, "rollbackDurationMs", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], ProjectPipelineMetricSummary.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, type: "jsonb" }),
    __metadata("design:type", Object)
], ProjectPipelineMetricSummary.prototype, "metadata", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: "created_at" }),
    __metadata("design:type", Date)
], ProjectPipelineMetricSummary.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: "updated_at" }),
    __metadata("design:type", Date)
], ProjectPipelineMetricSummary.prototype, "updatedAt", void 0);
exports.ProjectPipelineMetricSummary = ProjectPipelineMetricSummary = __decorate([
    (0, typeorm_1.Entity)("project_pipeline_metric_summaries")
], ProjectPipelineMetricSummary);
//# sourceMappingURL=project-pipeline-metric-summary.entity.js.map