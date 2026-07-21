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
exports.ProjectSecurityScan = exports.SecurityPolicyDecision = exports.SecurityScanStatus = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("../users/user.entity");
const project_pipeline_run_entity_1 = require("./project-pipeline-run.entity");
const project_entity_1 = require("./project.entity");
const project_security_finding_entity_1 = require("./project-security-finding.entity");
var SecurityScanStatus;
(function (SecurityScanStatus) {
    SecurityScanStatus["QUEUED"] = "queued";
    SecurityScanStatus["RUNNING"] = "running";
    SecurityScanStatus["COMPLETED"] = "completed";
    SecurityScanStatus["FAILED"] = "failed";
})(SecurityScanStatus || (exports.SecurityScanStatus = SecurityScanStatus = {}));
var SecurityPolicyDecision;
(function (SecurityPolicyDecision) {
    SecurityPolicyDecision["ALLOWED"] = "allowed";
    SecurityPolicyDecision["BLOCKED"] = "blocked";
    SecurityPolicyDecision["REQUIRES_APPROVAL"] = "requires_approval";
    SecurityPolicyDecision["APPROVED_OVERRIDE"] = "approved_override";
})(SecurityPolicyDecision || (exports.SecurityPolicyDecision = SecurityPolicyDecision = {}));
let ProjectSecurityScan = class ProjectSecurityScan {
};
exports.ProjectSecurityScan = ProjectSecurityScan;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)("uuid"),
    __metadata("design:type", String)
], ProjectSecurityScan.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.Column)({ name: "project_id" }),
    __metadata("design:type", String)
], ProjectSecurityScan.prototype, "projectId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => project_entity_1.Project, { nullable: false, onDelete: "CASCADE" }),
    (0, typeorm_1.JoinColumn)({ name: "project_id" }),
    __metadata("design:type", project_entity_1.Project)
], ProjectSecurityScan.prototype, "project", void 0);
__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.Column)({ nullable: true, name: "pipeline_run_id" }),
    __metadata("design:type", String)
], ProjectSecurityScan.prototype, "pipelineRunId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => project_pipeline_run_entity_1.ProjectPipelineRun, { nullable: true, onDelete: "SET NULL" }),
    (0, typeorm_1.JoinColumn)({ name: "pipeline_run_id" }),
    __metadata("design:type", project_pipeline_run_entity_1.ProjectPipelineRun)
], ProjectSecurityScan.prototype, "pipelineRun", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "image_name" }),
    __metadata("design:type", String)
], ProjectSecurityScan.prototype, "imageName", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, name: "image_tag" }),
    __metadata("design:type", String)
], ProjectSecurityScan.prototype, "imageTag", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, name: "image_uri" }),
    __metadata("design:type", String)
], ProjectSecurityScan.prototype, "imageUri", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: "trivy" }),
    __metadata("design:type", String)
], ProjectSecurityScan.prototype, "scanner", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, name: "scanner_version" }),
    __metadata("design:type", String)
], ProjectSecurityScan.prototype, "scannerVersion", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "scan_status" }),
    __metadata("design:type", String)
], ProjectSecurityScan.prototype, "scanStatus", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, name: "started_at", type: "timestamp" }),
    __metadata("design:type", Date)
], ProjectSecurityScan.prototype, "startedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, name: "completed_at", type: "timestamp" }),
    __metadata("design:type", Date)
], ProjectSecurityScan.prototype, "completedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, name: "failed_at", type: "timestamp" }),
    __metadata("design:type", Date)
], ProjectSecurityScan.prototype, "failedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 0, name: "total_vulnerabilities" }),
    __metadata("design:type", Number)
], ProjectSecurityScan.prototype, "totalVulnerabilities", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 0, name: "critical_count" }),
    __metadata("design:type", Number)
], ProjectSecurityScan.prototype, "criticalCount", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 0, name: "high_count" }),
    __metadata("design:type", Number)
], ProjectSecurityScan.prototype, "highCount", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 0, name: "medium_count" }),
    __metadata("design:type", Number)
], ProjectSecurityScan.prototype, "mediumCount", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 0, name: "low_count" }),
    __metadata("design:type", Number)
], ProjectSecurityScan.prototype, "lowCount", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 0, name: "unknown_count" }),
    __metadata("design:type", Number)
], ProjectSecurityScan.prototype, "unknownCount", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, name: "policy_decision" }),
    __metadata("design:type", String)
], ProjectSecurityScan.prototype, "policyDecision", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, name: "policy_reason", type: "text" }),
    __metadata("design:type", String)
], ProjectSecurityScan.prototype, "policyReason", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false, name: "manual_approval_required" }),
    __metadata("design:type", Boolean)
], ProjectSecurityScan.prototype, "manualApprovalRequired", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, name: "approved_by_user_id" }),
    __metadata("design:type", Number)
], ProjectSecurityScan.prototype, "approvedByUserId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { nullable: true, onDelete: "SET NULL" }),
    (0, typeorm_1.JoinColumn)({ name: "approved_by_user_id" }),
    __metadata("design:type", user_entity_1.User)
], ProjectSecurityScan.prototype, "approvedByUser", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, name: "approved_at", type: "timestamp" }),
    __metadata("design:type", Date)
], ProjectSecurityScan.prototype, "approvedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, name: "approval_reason", type: "text" }),
    __metadata("design:type", String)
], ProjectSecurityScan.prototype, "approvalReason", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, name: "raw_summary", type: "jsonb" }),
    __metadata("design:type", Object)
], ProjectSecurityScan.prototype, "rawSummary", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => project_security_finding_entity_1.ProjectSecurityFinding, (finding) => finding.scan),
    __metadata("design:type", Array)
], ProjectSecurityScan.prototype, "findings", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: "created_at" }),
    __metadata("design:type", Date)
], ProjectSecurityScan.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: "updated_at" }),
    __metadata("design:type", Date)
], ProjectSecurityScan.prototype, "updatedAt", void 0);
exports.ProjectSecurityScan = ProjectSecurityScan = __decorate([
    (0, typeorm_1.Entity)("project_security_scans")
], ProjectSecurityScan);
//# sourceMappingURL=project-security-scan.entity.js.map