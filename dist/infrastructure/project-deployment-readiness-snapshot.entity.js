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
exports.ProjectDeploymentReadinessSnapshot = void 0;
const typeorm_1 = require("typeorm");
const project_pipeline_run_entity_1 = require("../projects/project-pipeline-run.entity");
const project_entity_1 = require("../projects/project.entity");
const user_entity_1 = require("../users/user.entity");
let ProjectDeploymentReadinessSnapshot = class ProjectDeploymentReadinessSnapshot {
};
exports.ProjectDeploymentReadinessSnapshot = ProjectDeploymentReadinessSnapshot;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)("uuid"),
    __metadata("design:type", String)
], ProjectDeploymentReadinessSnapshot.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.Column)({ name: "project_id" }),
    __metadata("design:type", String)
], ProjectDeploymentReadinessSnapshot.prototype, "projectId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => project_entity_1.Project, { nullable: false, onDelete: "CASCADE" }),
    (0, typeorm_1.JoinColumn)({ name: "project_id" }),
    __metadata("design:type", project_entity_1.Project)
], ProjectDeploymentReadinessSnapshot.prototype, "project", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, name: "pipeline_run_id" }),
    __metadata("design:type", String)
], ProjectDeploymentReadinessSnapshot.prototype, "pipelineRunId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => project_pipeline_run_entity_1.ProjectPipelineRun, { nullable: true, onDelete: "SET NULL" }),
    (0, typeorm_1.JoinColumn)({ name: "pipeline_run_id" }),
    __metadata("design:type", project_pipeline_run_entity_1.ProjectPipelineRun)
], ProjectDeploymentReadinessSnapshot.prototype, "pipelineRun", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Boolean)
], ProjectDeploymentReadinessSnapshot.prototype, "ready", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "jsonb" }),
    __metadata("design:type", Array)
], ProjectDeploymentReadinessSnapshot.prototype, "checks", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "blocking_reasons", type: "jsonb" }),
    __metadata("design:type", Array)
], ProjectDeploymentReadinessSnapshot.prototype, "blockingReasons", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, name: "created_by_user_id" }),
    __metadata("design:type", Number)
], ProjectDeploymentReadinessSnapshot.prototype, "createdByUserId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { nullable: true, onDelete: "SET NULL" }),
    (0, typeorm_1.JoinColumn)({ name: "created_by_user_id" }),
    __metadata("design:type", user_entity_1.User)
], ProjectDeploymentReadinessSnapshot.prototype, "createdByUser", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: "created_at" }),
    __metadata("design:type", Date)
], ProjectDeploymentReadinessSnapshot.prototype, "createdAt", void 0);
exports.ProjectDeploymentReadinessSnapshot = ProjectDeploymentReadinessSnapshot = __decorate([
    (0, typeorm_1.Entity)("project_deployment_readiness_snapshots")
], ProjectDeploymentReadinessSnapshot);
//# sourceMappingURL=project-deployment-readiness-snapshot.entity.js.map