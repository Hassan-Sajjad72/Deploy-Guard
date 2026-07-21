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
exports.ProjectStateRecoveryRequest = exports.StateRecoveryStatus = void 0;
const typeorm_1 = require("typeorm");
var StateRecoveryStatus;
(function (StateRecoveryStatus) {
    StateRecoveryStatus["PENDING"] = "pending";
    StateRecoveryStatus["APPROVED"] = "approved";
    StateRecoveryStatus["REJECTED"] = "rejected";
    StateRecoveryStatus["COMPLETED"] = "completed";
    StateRecoveryStatus["FAILED"] = "failed";
})(StateRecoveryStatus || (exports.StateRecoveryStatus = StateRecoveryStatus = {}));
let ProjectStateRecoveryRequest = class ProjectStateRecoveryRequest {
};
exports.ProjectStateRecoveryRequest = ProjectStateRecoveryRequest;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)("uuid"),
    __metadata("design:type", String)
], ProjectStateRecoveryRequest.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.Column)({ name: "project_id" }),
    __metadata("design:type", String)
], ProjectStateRecoveryRequest.prototype, "projectId", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: "dev", name: "environment_name" }),
    __metadata("design:type", String)
], ProjectStateRecoveryRequest.prototype, "environmentName", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, name: "corrupted_version_id" }),
    __metadata("design:type", String)
], ProjectStateRecoveryRequest.prototype, "corruptedVersionId", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, name: "recovery_version_id" }),
    __metadata("design:type", String)
], ProjectStateRecoveryRequest.prototype, "recoveryVersionId", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: StateRecoveryStatus.PENDING }),
    __metadata("design:type", String)
], ProjectStateRecoveryRequest.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, name: "requested_by_user_id" }),
    __metadata("design:type", Number)
], ProjectStateRecoveryRequest.prototype, "requestedByUserId", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, name: "approved_by_user_id" }),
    __metadata("design:type", Number)
], ProjectStateRecoveryRequest.prototype, "approvedByUserId", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, type: "text" }),
    __metadata("design:type", String)
], ProjectStateRecoveryRequest.prototype, "reason", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, name: "completed_at", type: "timestamp" }),
    __metadata("design:type", Date)
], ProjectStateRecoveryRequest.prototype, "completedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, type: "jsonb" }),
    __metadata("design:type", Object)
], ProjectStateRecoveryRequest.prototype, "metadata", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: "created_at" }),
    __metadata("design:type", Date)
], ProjectStateRecoveryRequest.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: "updated_at" }),
    __metadata("design:type", Date)
], ProjectStateRecoveryRequest.prototype, "updatedAt", void 0);
exports.ProjectStateRecoveryRequest = ProjectStateRecoveryRequest = __decorate([
    (0, typeorm_1.Entity)("project_state_recovery_requests")
], ProjectStateRecoveryRequest);
//# sourceMappingURL=project-state-recovery-request.entity.js.map