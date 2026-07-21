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
exports.ProjectDetectionProfile = exports.DetectionConfidence = exports.DetectionStatus = void 0;
const typeorm_1 = require("typeorm");
const project_entity_1 = require("./project.entity");
var DetectionStatus;
(function (DetectionStatus) {
    DetectionStatus["SUCCESS"] = "success";
    DetectionStatus["NEEDS_MANUAL_DOCKERFILE"] = "needs_manual_dockerfile";
    DetectionStatus["FAILED"] = "failed";
})(DetectionStatus || (exports.DetectionStatus = DetectionStatus = {}));
var DetectionConfidence;
(function (DetectionConfidence) {
    DetectionConfidence["HIGH"] = "high";
    DetectionConfidence["MEDIUM"] = "medium";
    DetectionConfidence["LOW"] = "low";
})(DetectionConfidence || (exports.DetectionConfidence = DetectionConfidence = {}));
let ProjectDetectionProfile = class ProjectDetectionProfile {
};
exports.ProjectDetectionProfile = ProjectDetectionProfile;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)("uuid"),
    __metadata("design:type", String)
], ProjectDetectionProfile.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.Column)({ name: "project_id" }),
    __metadata("design:type", String)
], ProjectDetectionProfile.prototype, "projectId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => project_entity_1.Project, { nullable: false, onDelete: "CASCADE" }),
    (0, typeorm_1.JoinColumn)({ name: "project_id" }),
    __metadata("design:type", project_entity_1.Project)
], ProjectDetectionProfile.prototype, "project", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "repository_url" }),
    __metadata("design:type", String)
], ProjectDetectionProfile.prototype, "repositoryUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, name: "repository_full_name" }),
    __metadata("design:type", String)
], ProjectDetectionProfile.prototype, "repositoryFullName", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "target_branch" }),
    __metadata("design:type", String)
], ProjectDetectionProfile.prototype, "targetBranch", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, name: "commit_sha" }),
    __metadata("design:type", String)
], ProjectDetectionProfile.prototype, "commitSha", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], ProjectDetectionProfile.prototype, "ecosystem", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], ProjectDetectionProfile.prototype, "language", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], ProjectDetectionProfile.prototype, "framework", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, name: "framework_variant" }),
    __metadata("design:type", String)
], ProjectDetectionProfile.prototype, "frameworkVariant", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, name: "package_manager" }),
    __metadata("design:type", String)
], ProjectDetectionProfile.prototype, "packageManager", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, name: "runtime_version" }),
    __metadata("design:type", String)
], ProjectDetectionProfile.prototype, "runtimeVersion", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, name: "build_command" }),
    __metadata("design:type", String)
], ProjectDetectionProfile.prototype, "buildCommand", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, name: "start_command" }),
    __metadata("design:type", String)
], ProjectDetectionProfile.prototype, "startCommand", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, name: "expected_port" }),
    __metadata("design:type", Number)
], ProjectDetectionProfile.prototype, "expectedPort", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, name: "health_check_path" }),
    __metadata("design:type", String)
], ProjectDetectionProfile.prototype, "healthCheckPath", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false, name: "requires_database" }),
    __metadata("design:type", Boolean)
], ProjectDetectionProfile.prototype, "requiresDatabase", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, name: "database_type" }),
    __metadata("design:type", String)
], ProjectDetectionProfile.prototype, "databaseType", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false, name: "requires_persistent_storage" }),
    __metadata("design:type", Boolean)
], ProjectDetectionProfile.prototype, "requiresPersistentStorage", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false, name: "static_output" }),
    __metadata("design:type", Boolean)
], ProjectDetectionProfile.prototype, "staticOutput", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false, name: "dockerfile_required" }),
    __metadata("design:type", Boolean)
], ProjectDetectionProfile.prototype, "dockerfileRequired", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false, name: "has_dockerfile" }),
    __metadata("design:type", Boolean)
], ProjectDetectionProfile.prototype, "hasDockerfile", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, name: "selected_template" }),
    __metadata("design:type", String)
], ProjectDetectionProfile.prototype, "selectedTemplate", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], ProjectDetectionProfile.prototype, "confidence", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "detection_status" }),
    __metadata("design:type", String)
], ProjectDetectionProfile.prototype, "detectionStatus", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "jsonb", nullable: true }),
    __metadata("design:type", Array)
], ProjectDetectionProfile.prototype, "warnings", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "jsonb", nullable: true }),
    __metadata("design:type", Array)
], ProjectDetectionProfile.prototype, "errors", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "jsonb", nullable: true, name: "raw_profile" }),
    __metadata("design:type", Object)
], ProjectDetectionProfile.prototype, "rawProfile", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: "created_at" }),
    __metadata("design:type", Date)
], ProjectDetectionProfile.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: "updated_at" }),
    __metadata("design:type", Date)
], ProjectDetectionProfile.prototype, "updatedAt", void 0);
exports.ProjectDetectionProfile = ProjectDetectionProfile = __decorate([
    (0, typeorm_1.Entity)("project_detection_profiles"),
    (0, typeorm_1.Unique)(["projectId"])
], ProjectDetectionProfile);
//# sourceMappingURL=project-detection-profile.entity.js.map