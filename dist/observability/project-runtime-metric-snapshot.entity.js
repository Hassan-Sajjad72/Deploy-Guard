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
exports.ProjectRuntimeMetricSnapshot = exports.RuntimeMetricSource = void 0;
const typeorm_1 = require("typeorm");
const project_deployment_entity_1 = require("../orchestration/project-deployment.entity");
const project_pipeline_run_entity_1 = require("../projects/project-pipeline-run.entity");
const project_entity_1 = require("../projects/project.entity");
var RuntimeMetricSource;
(function (RuntimeMetricSource) {
    RuntimeMetricSource["PROMETHEUS"] = "prometheus";
    RuntimeMetricSource["CLOUDWATCH"] = "cloudwatch";
    RuntimeMetricSource["ECS"] = "ecs";
    RuntimeMetricSource["ALB"] = "alb";
})(RuntimeMetricSource || (exports.RuntimeMetricSource = RuntimeMetricSource = {}));
let ProjectRuntimeMetricSnapshot = class ProjectRuntimeMetricSnapshot {
};
exports.ProjectRuntimeMetricSnapshot = ProjectRuntimeMetricSnapshot;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)("uuid"),
    __metadata("design:type", String)
], ProjectRuntimeMetricSnapshot.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.Column)({ name: "project_id" }),
    __metadata("design:type", String)
], ProjectRuntimeMetricSnapshot.prototype, "projectId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => project_entity_1.Project, { nullable: false, onDelete: "CASCADE" }),
    (0, typeorm_1.JoinColumn)({ name: "project_id" }),
    __metadata("design:type", project_entity_1.Project)
], ProjectRuntimeMetricSnapshot.prototype, "project", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, name: "deployment_id" }),
    __metadata("design:type", String)
], ProjectRuntimeMetricSnapshot.prototype, "deploymentId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => project_deployment_entity_1.ProjectDeployment, { nullable: true, onDelete: "SET NULL" }),
    (0, typeorm_1.JoinColumn)({ name: "deployment_id" }),
    __metadata("design:type", project_deployment_entity_1.ProjectDeployment)
], ProjectRuntimeMetricSnapshot.prototype, "deployment", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, name: "pipeline_run_id" }),
    __metadata("design:type", String)
], ProjectRuntimeMetricSnapshot.prototype, "pipelineRunId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => project_pipeline_run_entity_1.ProjectPipelineRun, { nullable: true, onDelete: "SET NULL" }),
    (0, typeorm_1.JoinColumn)({ name: "pipeline_run_id" }),
    __metadata("design:type", project_pipeline_run_entity_1.ProjectPipelineRun)
], ProjectRuntimeMetricSnapshot.prototype, "pipelineRun", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], ProjectRuntimeMetricSnapshot.prototype, "source", void 0);
__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.Column)({ name: "metric_name" }),
    __metadata("design:type", String)
], ProjectRuntimeMetricSnapshot.prototype, "metricName", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, name: "metric_unit" }),
    __metadata("design:type", String)
], ProjectRuntimeMetricSnapshot.prototype, "metricUnit", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "numeric", transformer: { to: (value) => value, from: (value) => Number(value) } }),
    __metadata("design:type", Number)
], ProjectRuntimeMetricSnapshot.prototype, "value", void 0);
__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.Column)({ type: "timestamp" }),
    __metadata("design:type", Date)
], ProjectRuntimeMetricSnapshot.prototype, "timestamp", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, type: "jsonb" }),
    __metadata("design:type", Object)
], ProjectRuntimeMetricSnapshot.prototype, "labels", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, type: "jsonb" }),
    __metadata("design:type", Object)
], ProjectRuntimeMetricSnapshot.prototype, "metadata", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: "created_at" }),
    __metadata("design:type", Date)
], ProjectRuntimeMetricSnapshot.prototype, "createdAt", void 0);
exports.ProjectRuntimeMetricSnapshot = ProjectRuntimeMetricSnapshot = __decorate([
    (0, typeorm_1.Entity)("project_runtime_metric_snapshots")
], ProjectRuntimeMetricSnapshot);
//# sourceMappingURL=project-runtime-metric-snapshot.entity.js.map