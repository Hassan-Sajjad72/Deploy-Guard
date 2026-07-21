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
exports.EfsService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const project_infrastructure_environment_entity_1 = require("../infrastructure/project-infrastructure-environment.entity");
const project_persistent_storage_entity_1 = require("./project-persistent-storage.entity");
const storage_config_1 = require("./storage.config");
const backup_service_1 = require("./backup.service");
let EfsService = class EfsService {
    constructor(storageRepository, environmentRepository, config, backupService) {
        this.storageRepository = storageRepository;
        this.environmentRepository = environmentRepository;
        this.config = config;
        this.backupService = backupService;
    }
    async createOrUpdateEfsConfig(projectId, config) {
        const storageConfig = (0, storage_config_1.getStorageConfig)(this.config);
        const existing = await this.storageRepository.findOne({
            where: { projectId, environmentName: "dev" },
            order: { createdAt: "DESC" },
        });
        const storage = existing || this.storageRepository.create({ projectId, environmentName: "dev" });
        storage.enabled = config.enabled ?? storage.enabled ?? false;
        storage.userEnabled = config.enabled ?? storage.userEnabled ?? false;
        storage.status = storage.enabled ? project_persistent_storage_entity_1.PersistentStorageStatus.PENDING : project_persistent_storage_entity_1.PersistentStorageStatus.NOT_REQUIRED;
        storage.awsRegion = storageConfig.awsRegion;
        storage.posixUid = storageConfig.posixUid;
        storage.posixGid = storageConfig.posixGid;
        storage.rootPermissions = storageConfig.rootPermissions;
        storage.rootDirectory = `${storageConfig.rootDirectoryBase.replace(/\/$/, "")}/${projectId}/dev`;
        storage.encrypted = true;
        storage.backupEnabled = config.backupEnabled ?? storageConfig.backupEnabled;
        storage.backupRetentionDays = storageConfig.backupRetentionDays;
        storage.metadata = { backupSchedule: storageConfig.backupSchedule };
        return this.storageRepository.save(storage);
    }
    async provisionEfs(projectId, pipelineRunId) {
        const storage = await this.createOrUpdateEfsConfig(projectId, { enabled: true });
        storage.pipelineRunId = pipelineRunId;
        storage.status = project_persistent_storage_entity_1.PersistentStorageStatus.PROVISIONING;
        return this.storageRepository.save(storage);
    }
    parseEfsTerraformOutputs(outputs) {
        return {
            enabled: Boolean(outputs.efs_enabled),
            efsFileSystemId: this.stringOutput(outputs.efs_file_system_id),
            efsFileSystemArn: this.stringOutput(outputs.efs_file_system_arn),
            efsDnsName: this.stringOutput(outputs.efs_dns_name),
            efsAccessPointId: this.stringOutput(outputs.efs_access_point_id),
            efsAccessPointArn: this.stringOutput(outputs.efs_access_point_arn),
            efsSecurityGroupId: this.stringOutput(outputs.efs_security_group_id),
            kmsKeyId: this.stringOutput(outputs.efs_kms_key_id),
            kmsKeyArn: this.stringOutput(outputs.efs_kms_key_arn),
            mountTargetIds: Array.isArray(outputs.efs_mount_target_ids) ? outputs.efs_mount_target_ids.map(String) : [],
            rootDirectory: this.stringOutput(outputs.efs_root_directory),
            posixUid: Number(outputs.efs_posix_uid || 1000),
            posixGid: Number(outputs.efs_posix_gid || 1000),
            rootPermissions: this.stringOutput(outputs.efs_root_permissions) || "750",
            backupVaultName: this.stringOutput(outputs.efs_backup_vault_name),
            backupPlanId: this.stringOutput(outputs.efs_backup_plan_id),
            backupEnabled: Boolean(outputs.efs_backup_enabled),
        };
    }
    async saveEfsOutputs(projectId, pipelineRunId, outputs) {
        const parsed = this.parseEfsTerraformOutputs(outputs);
        const storage = await this.createOrUpdateEfsConfig(projectId, { enabled: parsed.enabled, backupEnabled: parsed.backupEnabled });
        const environment = await this.environmentRepository.findOne({ where: { projectId }, order: { createdAt: "DESC" } });
        storage.pipelineRunId = pipelineRunId;
        storage.infrastructureEnvironmentId = environment?.id || storage.infrastructureEnvironmentId || null;
        storage.enabled = parsed.enabled;
        storage.status = parsed.enabled ? project_persistent_storage_entity_1.PersistentStorageStatus.PROVISIONED : project_persistent_storage_entity_1.PersistentStorageStatus.NOT_REQUIRED;
        storage.efsFileSystemId = parsed.efsFileSystemId;
        storage.efsFileSystemArn = parsed.efsFileSystemArn;
        storage.efsDnsName = parsed.efsDnsName;
        storage.efsAccessPointId = parsed.efsAccessPointId;
        storage.efsAccessPointArn = parsed.efsAccessPointArn;
        storage.efsSecurityGroupId = parsed.efsSecurityGroupId;
        storage.kmsKeyId = parsed.kmsKeyId;
        storage.kmsKeyArn = parsed.kmsKeyArn;
        storage.mountTargetIds = parsed.mountTargetIds;
        storage.rootDirectory = parsed.rootDirectory || storage.rootDirectory;
        storage.posixUid = parsed.posixUid;
        storage.posixGid = parsed.posixGid;
        storage.rootPermissions = parsed.rootPermissions;
        storage.encrypted = parsed.enabled;
        storage.backupEnabled = parsed.backupEnabled;
        storage.backupVaultName = parsed.backupVaultName;
        storage.backupPlanId = parsed.backupPlanId;
        storage.ecsMountConfig = this.getEfsEcsMountConfigFromStorage(storage);
        storage.provisionedAt = parsed.enabled ? new Date() : null;
        const saved = await this.storageRepository.save(storage);
        await this.backupService.markBackupProtected(saved);
        return saved;
    }
    async getEfsStatus(projectId) {
        return this.storageRepository.findOne({
            where: { projectId, environmentName: "dev" },
            order: { createdAt: "DESC" },
        });
    }
    async getEfsMountInstructions(projectId) {
        const storage = await this.getEfsStatus(projectId);
        return storage ? this.getEfsEcsMountConfigFromStorage(storage) : null;
    }
    getEfsEcsMountConfig(projectId) {
        return this.getEfsMountInstructions(projectId);
    }
    getEfsEcsMountConfigFromStorage(storage) {
        if (!storage.efsFileSystemId || !storage.efsAccessPointId) {
            return null;
        }
        return {
            volumes: [
                {
                    name: "persistent-storage",
                    efsVolumeConfiguration: {
                        fileSystemId: storage.efsFileSystemId,
                        transitEncryption: "ENABLED",
                        authorizationConfig: {
                            accessPointId: storage.efsAccessPointId,
                            iam: "ENABLED",
                        },
                    },
                },
            ],
            mountPoints: [
                {
                    sourceVolume: "persistent-storage",
                    containerPath: "/app/data",
                    readOnly: false,
                },
            ],
        };
    }
    stringOutput(value) {
        return value === undefined || value === null ? null : String(value);
    }
};
exports.EfsService = EfsService;
exports.EfsService = EfsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(project_persistent_storage_entity_1.ProjectPersistentStorage)),
    __param(1, (0, typeorm_1.InjectRepository)(project_infrastructure_environment_entity_1.ProjectInfrastructureEnvironment)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        config_1.ConfigService,
        backup_service_1.BackupService])
], EfsService);
//# sourceMappingURL=efs.service.js.map