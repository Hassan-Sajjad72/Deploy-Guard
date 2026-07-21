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
exports.ProjectBackupRecord = exports.BackupRecordStatus = void 0;
const typeorm_1 = require("typeorm");
const project_persistent_storage_entity_1 = require("./project-persistent-storage.entity");
var BackupRecordStatus;
(function (BackupRecordStatus) {
    BackupRecordStatus["CONFIGURED"] = "configured";
    BackupRecordStatus["BACKUP_AVAILABLE"] = "backup_available";
    BackupRecordStatus["RESTORE_REQUESTED"] = "restore_requested";
    BackupRecordStatus["RESTORE_IN_PROGRESS"] = "restore_in_progress";
    BackupRecordStatus["RESTORED"] = "restored";
    BackupRecordStatus["FAILED"] = "failed";
})(BackupRecordStatus || (exports.BackupRecordStatus = BackupRecordStatus = {}));
let ProjectBackupRecord = class ProjectBackupRecord {
};
exports.ProjectBackupRecord = ProjectBackupRecord;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)("uuid"),
    __metadata("design:type", String)
], ProjectBackupRecord.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.Column)({ name: "project_id" }),
    __metadata("design:type", String)
], ProjectBackupRecord.prototype, "projectId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "persistent_storage_id" }),
    __metadata("design:type", String)
], ProjectBackupRecord.prototype, "persistentStorageId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => project_persistent_storage_entity_1.ProjectPersistentStorage, { nullable: false, onDelete: "CASCADE" }),
    (0, typeorm_1.JoinColumn)({ name: "persistent_storage_id" }),
    __metadata("design:type", project_persistent_storage_entity_1.ProjectPersistentStorage)
], ProjectBackupRecord.prototype, "persistentStorage", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: "aws_backup", name: "backup_provider" }),
    __metadata("design:type", String)
], ProjectBackupRecord.prototype, "backupProvider", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, name: "backup_vault_name" }),
    __metadata("design:type", String)
], ProjectBackupRecord.prototype, "backupVaultName", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, name: "backup_plan_id" }),
    __metadata("design:type", String)
], ProjectBackupRecord.prototype, "backupPlanId", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, name: "recovery_point_arn" }),
    __metadata("design:type", String)
], ProjectBackupRecord.prototype, "recoveryPointArn", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: BackupRecordStatus.CONFIGURED }),
    __metadata("design:type", String)
], ProjectBackupRecord.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, name: "retention_days" }),
    __metadata("design:type", Number)
], ProjectBackupRecord.prototype, "retentionDays", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], ProjectBackupRecord.prototype, "schedule", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, type: "jsonb" }),
    __metadata("design:type", Object)
], ProjectBackupRecord.prototype, "metadata", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: "created_at" }),
    __metadata("design:type", Date)
], ProjectBackupRecord.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: "updated_at" }),
    __metadata("design:type", Date)
], ProjectBackupRecord.prototype, "updatedAt", void 0);
exports.ProjectBackupRecord = ProjectBackupRecord = __decorate([
    (0, typeorm_1.Entity)("project_backup_records")
], ProjectBackupRecord);
//# sourceMappingURL=project-backup-record.entity.js.map