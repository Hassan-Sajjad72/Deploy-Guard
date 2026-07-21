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
exports.StoragePolicyService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const project_detection_profile_entity_1 = require("../projects/project-detection-profile.entity");
const project_persistent_storage_entity_1 = require("./project-persistent-storage.entity");
const storage_config_1 = require("./storage.config");
let StoragePolicyService = class StoragePolicyService {
    constructor(profileRepository, storageRepository, config) {
        this.profileRepository = profileRepository;
        this.storageRepository = storageRepository;
        this.config = config;
    }
    async detectPersistentStorageNeed(projectId) {
        const profile = await this.profileRepository.findOne({ where: { projectId } });
        const raw = JSON.stringify(profile?.rawProfile || {}).toLowerCase();
        const reasons = [];
        if (profile?.requiresPersistentStorage)
            reasons.push("Detection profile requires persistent storage.");
        if (profile?.requiresDatabase && /sqlite|file.?database/.test(raw))
            reasons.push("SQLite or file database indicator detected.");
        if (/media_root|upload|uploads|media\//.test(raw))
            reasons.push("Uploads/media storage indicator detected.");
        if (/django/.test((profile?.framework || "").toLowerCase()) && /media/.test(raw))
            reasons.push("Django media storage indicator detected.");
        if (/flask/.test((profile?.framework || "").toLowerCase()) && /upload/.test(raw))
            reasons.push("Flask upload folder indicator detected.");
        return {
            required: reasons.length > 0,
            reasons,
            profile,
        };
    }
    async getPersistentStorageRecommendation(projectId) {
        const detection = await this.detectPersistentStorageNeed(projectId);
        const storage = await this.storageRepository.findOne({
            where: { projectId, environmentName: "dev" },
            order: { createdAt: "DESC" },
        });
        return {
            required: detection.required,
            recommended: detection.required || Boolean(storage?.userEnabled),
            enabled: Boolean(storage?.enabled),
            reasons: detection.reasons.length > 0 ? detection.reasons : ["Persistent storage not required for the current detection profile."],
        };
    }
    async shouldProvisionEfs(projectId) {
        const config = (0, storage_config_1.getStorageConfig)(this.config);
        const storage = await this.storageRepository.findOne({
            where: { projectId, environmentName: "dev" },
            order: { createdAt: "DESC" },
        });
        const detection = await this.detectPersistentStorageNeed(projectId);
        return config.enableEfs && (config.defaultEnabled || detection.required || Boolean(storage?.enabled));
    }
    async buildEfsTerraformVariables(projectId, environmentName = "dev") {
        const config = (0, storage_config_1.getStorageConfig)(this.config);
        const enableEfs = await this.shouldProvisionEfs(projectId);
        return {
            enable_efs: enableEfs,
            efs_performance_mode: config.performanceMode,
            efs_throughput_mode: config.throughputMode,
            efs_transition_to_ia: config.transitionToIa,
            efs_posix_uid: config.posixUid,
            efs_posix_gid: config.posixGid,
            efs_root_permissions: config.rootPermissions,
            efs_root_directory: `${config.rootDirectoryBase.replace(/\/$/, "")}/${projectId}/${environmentName}`,
            enable_efs_backup: config.backupEnabled,
            efs_backup_retention_days: config.backupRetentionDays,
            efs_backup_schedule: config.backupSchedule,
        };
    }
};
exports.StoragePolicyService = StoragePolicyService;
exports.StoragePolicyService = StoragePolicyService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(project_detection_profile_entity_1.ProjectDetectionProfile)),
    __param(1, (0, typeorm_1.InjectRepository)(project_persistent_storage_entity_1.ProjectPersistentStorage)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        config_1.ConfigService])
], StoragePolicyService);
//# sourceMappingURL=storage-policy.service.js.map