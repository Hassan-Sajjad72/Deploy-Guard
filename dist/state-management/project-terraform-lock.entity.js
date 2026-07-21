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
exports.ProjectTerraformLock = exports.TerraformLockStatus = void 0;
const typeorm_1 = require("typeorm");
var TerraformLockStatus;
(function (TerraformLockStatus) {
    TerraformLockStatus["ACQUIRED"] = "acquired";
    TerraformLockStatus["HEARTBEAT_ACTIVE"] = "heartbeat_active";
    TerraformLockStatus["QUEUED"] = "queued";
    TerraformLockStatus["RELEASED"] = "released";
    TerraformLockStatus["ORPHANED"] = "orphaned";
    TerraformLockStatus["FORCE_RELEASED"] = "force_released";
    TerraformLockStatus["FAILED"] = "failed";
})(TerraformLockStatus || (exports.TerraformLockStatus = TerraformLockStatus = {}));
let ProjectTerraformLock = class ProjectTerraformLock {
};
exports.ProjectTerraformLock = ProjectTerraformLock;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)("uuid"),
    __metadata("design:type", String)
], ProjectTerraformLock.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "lock_id" }),
    __metadata("design:type", String)
], ProjectTerraformLock.prototype, "lockId", void 0);
__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.Column)({ name: "project_id" }),
    __metadata("design:type", String)
], ProjectTerraformLock.prototype, "projectId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "pipeline_run_id" }),
    __metadata("design:type", String)
], ProjectTerraformLock.prototype, "pipelineRunId", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, name: "deployment_id" }),
    __metadata("design:type", String)
], ProjectTerraformLock.prototype, "deploymentId", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: "dev", name: "environment_name" }),
    __metadata("design:type", String)
], ProjectTerraformLock.prototype, "environmentName", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, name: "user_id" }),
    __metadata("design:type", Number)
], ProjectTerraformLock.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: TerraformLockStatus.ACQUIRED }),
    __metadata("design:type", String)
], ProjectTerraformLock.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, name: "owner_worker_id" }),
    __metadata("design:type", String)
], ProjectTerraformLock.prototype, "ownerWorkerId", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, name: "terraform_pid" }),
    __metadata("design:type", Number)
], ProjectTerraformLock.prototype, "terraformPid", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "acquired_at", type: "timestamp" }),
    __metadata("design:type", Date)
], ProjectTerraformLock.prototype, "acquiredAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, name: "heartbeat_at", type: "timestamp" }),
    __metadata("design:type", Date)
], ProjectTerraformLock.prototype, "heartbeatAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 30, name: "heartbeat_interval_seconds" }),
    __metadata("design:type", Number)
], ProjectTerraformLock.prototype, "heartbeatIntervalSeconds", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 300, name: "stale_after_seconds" }),
    __metadata("design:type", Number)
], ProjectTerraformLock.prototype, "staleAfterSeconds", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, name: "released_at", type: "timestamp" }),
    __metadata("design:type", Date)
], ProjectTerraformLock.prototype, "releasedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, name: "force_released_at", type: "timestamp" }),
    __metadata("design:type", Date)
], ProjectTerraformLock.prototype, "forceReleasedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, type: "jsonb" }),
    __metadata("design:type", Object)
], ProjectTerraformLock.prototype, "metadata", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: "created_at" }),
    __metadata("design:type", Date)
], ProjectTerraformLock.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: "updated_at" }),
    __metadata("design:type", Date)
], ProjectTerraformLock.prototype, "updatedAt", void 0);
exports.ProjectTerraformLock = ProjectTerraformLock = __decorate([
    (0, typeorm_1.Entity)("project_terraform_locks"),
    (0, typeorm_1.Unique)(["lockId"])
], ProjectTerraformLock);
//# sourceMappingURL=project-terraform-lock.entity.js.map