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
exports.ProjectSecurityFinding = exports.SecurityFindingSeverity = void 0;
const typeorm_1 = require("typeorm");
const project_pipeline_run_entity_1 = require("./project-pipeline-run.entity");
const project_security_scan_entity_1 = require("./project-security-scan.entity");
const project_entity_1 = require("./project.entity");
var SecurityFindingSeverity;
(function (SecurityFindingSeverity) {
    SecurityFindingSeverity["CRITICAL"] = "CRITICAL";
    SecurityFindingSeverity["HIGH"] = "HIGH";
    SecurityFindingSeverity["MEDIUM"] = "MEDIUM";
    SecurityFindingSeverity["LOW"] = "LOW";
    SecurityFindingSeverity["UNKNOWN"] = "UNKNOWN";
})(SecurityFindingSeverity || (exports.SecurityFindingSeverity = SecurityFindingSeverity = {}));
let ProjectSecurityFinding = class ProjectSecurityFinding {
};
exports.ProjectSecurityFinding = ProjectSecurityFinding;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)("uuid"),
    __metadata("design:type", String)
], ProjectSecurityFinding.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.Column)({ name: "scan_id" }),
    __metadata("design:type", String)
], ProjectSecurityFinding.prototype, "scanId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => project_security_scan_entity_1.ProjectSecurityScan, (scan) => scan.findings, {
        nullable: false,
        onDelete: "CASCADE",
    }),
    (0, typeorm_1.JoinColumn)({ name: "scan_id" }),
    __metadata("design:type", project_security_scan_entity_1.ProjectSecurityScan)
], ProjectSecurityFinding.prototype, "scan", void 0);
__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.Column)({ name: "project_id" }),
    __metadata("design:type", String)
], ProjectSecurityFinding.prototype, "projectId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => project_entity_1.Project, { nullable: false, onDelete: "CASCADE" }),
    (0, typeorm_1.JoinColumn)({ name: "project_id" }),
    __metadata("design:type", project_entity_1.Project)
], ProjectSecurityFinding.prototype, "project", void 0);
__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.Column)({ nullable: true, name: "pipeline_run_id" }),
    __metadata("design:type", String)
], ProjectSecurityFinding.prototype, "pipelineRunId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => project_pipeline_run_entity_1.ProjectPipelineRun, { nullable: true, onDelete: "SET NULL" }),
    (0, typeorm_1.JoinColumn)({ name: "pipeline_run_id" }),
    __metadata("design:type", project_pipeline_run_entity_1.ProjectPipelineRun)
], ProjectSecurityFinding.prototype, "pipelineRun", void 0);
__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.Column)({ name: "vulnerability_id" }),
    __metadata("design:type", String)
], ProjectSecurityFinding.prototype, "vulnerabilityId", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], ProjectSecurityFinding.prototype, "severity", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, name: "package_name" }),
    __metadata("design:type", String)
], ProjectSecurityFinding.prototype, "packageName", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, name: "installed_version" }),
    __metadata("design:type", String)
], ProjectSecurityFinding.prototype, "installedVersion", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, name: "fixed_version" }),
    __metadata("design:type", String)
], ProjectSecurityFinding.prototype, "fixedVersion", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], ProjectSecurityFinding.prototype, "target", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], ProjectSecurityFinding.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, type: "text" }),
    __metadata("design:type", String)
], ProjectSecurityFinding.prototype, "title", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, type: "text" }),
    __metadata("design:type", String)
], ProjectSecurityFinding.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, name: "primary_url", type: "text" }),
    __metadata("design:type", String)
], ProjectSecurityFinding.prototype, "primaryUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, type: "text" }),
    __metadata("design:type", String)
], ProjectSecurityFinding.prototype, "remediation", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: "created_at" }),
    __metadata("design:type", Date)
], ProjectSecurityFinding.prototype, "createdAt", void 0);
exports.ProjectSecurityFinding = ProjectSecurityFinding = __decorate([
    (0, typeorm_1.Entity)("project_security_findings")
], ProjectSecurityFinding);
//# sourceMappingURL=project-security-finding.entity.js.map