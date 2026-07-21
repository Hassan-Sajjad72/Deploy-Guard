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
exports.ProjectStableRelease = exports.StableReleaseStatus = void 0;
const typeorm_1 = require("typeorm");
const project_entity_1 = require("../projects/project.entity");
var StableReleaseStatus;
(function (StableReleaseStatus) {
    StableReleaseStatus["STABLE"] = "stable";
    StableReleaseStatus["SUPERSEDED"] = "superseded";
    StableReleaseStatus["ROLLBACK_TARGET"] = "rollback_target";
    StableReleaseStatus["INVALID"] = "invalid";
})(StableReleaseStatus || (exports.StableReleaseStatus = StableReleaseStatus = {}));
let ProjectStableRelease = class ProjectStableRelease {
};
exports.ProjectStableRelease = ProjectStableRelease;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)("uuid"),
    __metadata("design:type", String)
], ProjectStableRelease.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.Column)({ name: "project_id" }),
    __metadata("design:type", String)
], ProjectStableRelease.prototype, "projectId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => project_entity_1.Project, { nullable: false, onDelete: "CASCADE" }),
    (0, typeorm_1.JoinColumn)({ name: "project_id" }),
    __metadata("design:type", project_entity_1.Project)
], ProjectStableRelease.prototype, "project", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: "dev", name: "environment_name" }),
    __metadata("design:type", String)
], ProjectStableRelease.prototype, "environmentName", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "commit_sha" }),
    __metadata("design:type", String)
], ProjectStableRelease.prototype, "commitSha", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "short_commit_sha" }),
    __metadata("design:type", String)
], ProjectStableRelease.prototype, "shortCommitSha", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "image_uri" }),
    __metadata("design:type", String)
], ProjectStableRelease.prototype, "imageUri", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "task_definition_arn" }),
    __metadata("design:type", String)
], ProjectStableRelease.prototype, "taskDefinitionArn", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, name: "ecs_service_arn" }),
    __metadata("design:type", String)
], ProjectStableRelease.prototype, "ecsServiceArn", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: "/health", name: "health_check_path" }),
    __metadata("design:type", String)
], ProjectStableRelease.prototype, "healthCheckPath", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, name: "app_port" }),
    __metadata("design:type", Number)
], ProjectStableRelease.prototype, "appPort", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, name: "deployed_by_pipeline_run_id" }),
    __metadata("design:type", String)
], ProjectStableRelease.prototype, "deployedByPipelineRunId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "deployed_at", type: "timestamp" }),
    __metadata("design:type", Date)
], ProjectStableRelease.prototype, "deployedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: StableReleaseStatus.STABLE }),
    __metadata("design:type", String)
], ProjectStableRelease.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, type: "jsonb" }),
    __metadata("design:type", Object)
], ProjectStableRelease.prototype, "metadata", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: "created_at" }),
    __metadata("design:type", Date)
], ProjectStableRelease.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: "updated_at" }),
    __metadata("design:type", Date)
], ProjectStableRelease.prototype, "updatedAt", void 0);
exports.ProjectStableRelease = ProjectStableRelease = __decorate([
    (0, typeorm_1.Entity)("project_stable_releases")
], ProjectStableRelease);
//# sourceMappingURL=project-stable-release.entity.js.map