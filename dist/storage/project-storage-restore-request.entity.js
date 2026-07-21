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
exports.ProjectStorageRestoreRequest = exports.StorageRestoreStatus = void 0;
const typeorm_1 = require("typeorm");
var StorageRestoreStatus;
(function (StorageRestoreStatus) {
    StorageRestoreStatus["PENDING"] = "pending";
    StorageRestoreStatus["APPROVED"] = "approved";
    StorageRestoreStatus["REJECTED"] = "rejected";
    StorageRestoreStatus["RESTORING"] = "restoring";
    StorageRestoreStatus["RESTORED"] = "restored";
    StorageRestoreStatus["FAILED"] = "failed";
})(StorageRestoreStatus || (exports.StorageRestoreStatus = StorageRestoreStatus = {}));
let ProjectStorageRestoreRequest = class ProjectStorageRestoreRequest {
};
exports.ProjectStorageRestoreRequest = ProjectStorageRestoreRequest;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)("uuid"),
    __metadata("design:type", String)
], ProjectStorageRestoreRequest.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.Column)({ name: "project_id" }),
    __metadata("design:type", String)
], ProjectStorageRestoreRequest.prototype, "projectId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "persistent_storage_id" }),
    __metadata("design:type", String)
], ProjectStorageRestoreRequest.prototype, "persistentStorageId", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, name: "recovery_point_arn" }),
    __metadata("design:type", String)
], ProjectStorageRestoreRequest.prototype, "recoveryPointArn", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: StorageRestoreStatus.PENDING }),
    __metadata("design:type", String)
], ProjectStorageRestoreRequest.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, name: "requested_by_user_id" }),
    __metadata("design:type", Number)
], ProjectStorageRestoreRequest.prototype, "requestedByUserId", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, name: "approved_by_user_id" }),
    __metadata("design:type", Number)
], ProjectStorageRestoreRequest.prototype, "approvedByUserId", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, type: "text" }),
    __metadata("design:type", String)
], ProjectStorageRestoreRequest.prototype, "reason", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, name: "completed_at", type: "timestamp" }),
    __metadata("design:type", Date)
], ProjectStorageRestoreRequest.prototype, "completedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, type: "jsonb" }),
    __metadata("design:type", Object)
], ProjectStorageRestoreRequest.prototype, "metadata", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: "created_at" }),
    __metadata("design:type", Date)
], ProjectStorageRestoreRequest.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: "updated_at" }),
    __metadata("design:type", Date)
], ProjectStorageRestoreRequest.prototype, "updatedAt", void 0);
exports.ProjectStorageRestoreRequest = ProjectStorageRestoreRequest = __decorate([
    (0, typeorm_1.Entity)("project_storage_restore_requests")
], ProjectStorageRestoreRequest);
//# sourceMappingURL=project-storage-restore-request.entity.js.map