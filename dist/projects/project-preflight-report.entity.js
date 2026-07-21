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
exports.ProjectPreflightReport = exports.PreflightValidationStatus = void 0;
const typeorm_1 = require("typeorm");
const project_detection_profile_entity_1 = require("./project-detection-profile.entity");
const project_entity_1 = require("./project.entity");
var PreflightValidationStatus;
(function (PreflightValidationStatus) {
    PreflightValidationStatus["PASSED"] = "passed";
    PreflightValidationStatus["PASSED_WITH_WARNINGS"] = "passed_with_warnings";
    PreflightValidationStatus["FAILED"] = "failed";
    PreflightValidationStatus["MANUAL_DOCKERFILE_REQUIRED"] = "manual_dockerfile_required";
})(PreflightValidationStatus || (exports.PreflightValidationStatus = PreflightValidationStatus = {}));
let ProjectPreflightReport = class ProjectPreflightReport {
};
exports.ProjectPreflightReport = ProjectPreflightReport;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)("uuid"),
    __metadata("design:type", String)
], ProjectPreflightReport.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.Column)({ name: "project_id" }),
    __metadata("design:type", String)
], ProjectPreflightReport.prototype, "projectId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => project_entity_1.Project, { nullable: false, onDelete: "CASCADE" }),
    (0, typeorm_1.JoinColumn)({ name: "project_id" }),
    __metadata("design:type", project_entity_1.Project)
], ProjectPreflightReport.prototype, "project", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, name: "detection_profile_id" }),
    __metadata("design:type", String)
], ProjectPreflightReport.prototype, "detectionProfileId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => project_detection_profile_entity_1.ProjectDetectionProfile, { nullable: true, onDelete: "SET NULL" }),
    (0, typeorm_1.JoinColumn)({ name: "detection_profile_id" }),
    __metadata("design:type", project_detection_profile_entity_1.ProjectDetectionProfile)
], ProjectPreflightReport.prototype, "detectionProfile", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "template_key" }),
    __metadata("design:type", String)
], ProjectPreflightReport.prototype, "templateKey", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, name: "template_display_name" }),
    __metadata("design:type", String)
], ProjectPreflightReport.prototype, "templateDisplayName", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], ProjectPreflightReport.prototype, "ecosystem", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], ProjectPreflightReport.prototype, "framework", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, name: "framework_variant" }),
    __metadata("design:type", String)
], ProjectPreflightReport.prototype, "frameworkVariant", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, name: "package_manager" }),
    __metadata("design:type", String)
], ProjectPreflightReport.prototype, "packageManager", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, name: "runtime_version" }),
    __metadata("design:type", String)
], ProjectPreflightReport.prototype, "runtimeVersion", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, name: "expected_port" }),
    __metadata("design:type", Number)
], ProjectPreflightReport.prototype, "expectedPort", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, name: "build_command" }),
    __metadata("design:type", String)
], ProjectPreflightReport.prototype, "buildCommand", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, name: "start_command" }),
    __metadata("design:type", String)
], ProjectPreflightReport.prototype, "startCommand", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, name: "health_check_path" }),
    __metadata("design:type", String)
], ProjectPreflightReport.prototype, "healthCheckPath", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false, name: "has_dockerfile" }),
    __metadata("design:type", Boolean)
], ProjectPreflightReport.prototype, "hasDockerfile", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false, name: "dockerfile_required" }),
    __metadata("design:type", Boolean)
], ProjectPreflightReport.prototype, "dockerfileRequired", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, type: "text", name: "generated_dockerfile" }),
    __metadata("design:type", String)
], ProjectPreflightReport.prototype, "generatedDockerfile", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "jsonb" }),
    __metadata("design:type", Object)
], ProjectPreflightReport.prototype, "report", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "validation_status" }),
    __metadata("design:type", String)
], ProjectPreflightReport.prototype, "validationStatus", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "jsonb", nullable: true }),
    __metadata("design:type", Array)
], ProjectPreflightReport.prototype, "warnings", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "jsonb", nullable: true }),
    __metadata("design:type", Array)
], ProjectPreflightReport.prototype, "errors", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: "created_at" }),
    __metadata("design:type", Date)
], ProjectPreflightReport.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: "updated_at" }),
    __metadata("design:type", Date)
], ProjectPreflightReport.prototype, "updatedAt", void 0);
exports.ProjectPreflightReport = ProjectPreflightReport = __decorate([
    (0, typeorm_1.Entity)("project_preflight_reports"),
    (0, typeorm_1.Unique)(["projectId"])
], ProjectPreflightReport);
//# sourceMappingURL=project-preflight-report.entity.js.map