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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BackupService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const project_backup_record_entity_1 = require("./project-backup-record.entity");
const project_storage_restore_request_entity_1 = require("./project-storage-restore-request.entity");
let BackupService = class BackupService {
    constructor(backupRepository, restoreRepository) {
        this.backupRepository = backupRepository;
        this.restoreRepository = restoreRepository;
    }
    async configureBackupPlan(storage) {
        if (!storage.backupEnabled || !storage.backupVaultName) {
            return null;
        }
        const existing = await this.backupRepository.findOne({
            where: { projectId: storage.projectId, persistentStorageId: storage.id },
        });
        const record = existing || this.backupRepository.create({
            projectId: storage.projectId,
            persistentStorageId: storage.id,
        });
        record.backupVaultName = storage.backupVaultName;
        record.backupPlanId = storage.backupPlanId;
        record.status = project_backup_record_entity_1.BackupRecordStatus.CONFIGURED;
        record.retentionDays = storage.backupRetentionDays;
        record.schedule = storage.metadata?.backupSchedule ? String(storage.metadata.backupSchedule) : null;
        return this.backupRepository.save(record);
    }
    async getBackupStatus(projectId) {
        return this.backupRepository.find({
            where: { projectId },
            order: { createdAt: "DESC" },
        });
    }
    async listBackupRecoveryPoints(projectId) {
        return this.getBackupStatus(projectId);
    }
    async createRestoreRequest(projectId, persistentStorageId, recoveryPointArn, requestedByUserId, reason) {
        return this.restoreRepository.save(this.restoreRepository.create({
            projectId,
            persistentStorageId,
            recoveryPointArn,
            requestedByUserId: requestedByUserId || null,
            reason: reason || "Restore request created. Actual AWS restore is reserved for a later workflow.",
        }));
    }
    async markBackupProtected(storage) {
        return this.configureBackupPlan(storage);
    }
};
exports.BackupService = BackupService;
exports.BackupService = BackupService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(project_backup_record_entity_1.ProjectBackupRecord)),
    __param(1, (0, typeorm_1.InjectRepository)(project_storage_restore_request_entity_1.ProjectStorageRestoreRequest)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], BackupService);
//# sourceMappingURL=backup.service.js.map