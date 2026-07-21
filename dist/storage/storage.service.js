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
exports.StorageService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const bullmq_1 = require("bullmq");
const typeorm_2 = require("typeorm");
const audit_log_service_1 = require("../audit-log/audit-log.service");
const project_pipeline_run_entity_1 = require("../projects/project-pipeline-run.entity");
const pipeline_types_1 = require("../projects/pipeline/pipeline.types");
const project_entity_1 = require("../projects/project.entity");
const user_entity_1 = require("../users/user.entity");
const backup_service_1 = require("./backup.service");
const efs_service_1 = require("./efs.service");
const project_persistent_storage_entity_1 = require("./project-persistent-storage.entity");
const project_storage_event_entity_1 = require("./project-storage-event.entity");
const storage_policy_service_1 = require("./storage-policy.service");
let StorageService = class StorageService {
    constructor(projectRepository, runRepository, storageRepository, eventRepository, pipelineQueue, auditLogService, policyService, efsService, backupService) {
        this.projectRepository = projectRepository;
        this.runRepository = runRepository;
        this.storageRepository = storageRepository;
        this.eventRepository = eventRepository;
        this.pipelineQueue = pipelineQueue;
        this.auditLogService = auditLogService;
        this.policyService = policyService;
        this.efsService = efsService;
        this.backupService = backupService;
    }
    async getRecommendation(user, projectId) {
        const project = await this.findProjectForView(user, projectId);
        return this.policyService.getPersistentStorageRecommendation(project.id);
    }
    async getStorage(user, projectId) {
        const project = await this.findProjectForView(user, projectId);
        return this.storageRepository.findOne({
            where: { projectId: project.id, environmentName: "dev" },
            order: { createdAt: "DESC" },
        });
    }
    async updateSettings(user, projectId, dto, req) {
        const project = await this.findProjectForManage(user, projectId);
        const detection = await this.policyService.detectPersistentStorageNeed(project.id);
        const storage = await this.efsService.createOrUpdateEfsConfig(project.id, {
            enabled: dto.enabled,
            backupEnabled: dto.backupEnabled,
        });
        storage.requiredByDetection = detection.required;
        await this.storageRepository.save(storage);
        await this.event(project.id, null, storage.id, "storage_settings_updated", "success", "Persistent storage settings updated.", user, {
            enabled: storage.enabled,
            backupEnabled: storage.backupEnabled,
            requiredByDetection: storage.requiredByDetection,
        });
        await this.audit("STORAGE_SETTINGS_UPDATED", project.id, user, "success", {
            storageId: storage.id,
            enabled: storage.enabled,
            backupEnabled: storage.backupEnabled,
            requiredByDetection: storage.requiredByDetection,
        }, req);
        return storage;
    }
    async provision(user, projectId, req) {
        const project = await this.findProjectForManage(user, projectId);
        const storage = await this.efsService.createOrUpdateEfsConfig(project.id, {
            enabled: true,
        });
        if (!storage.enabled) {
            throw new common_1.BadRequestException("Persistent storage is disabled for this project.");
        }
        const run = await this.runRepository.save(this.runRepository.create({
            projectId: project.id,
            triggeredByUserId: user.id,
            repositoryUrl: project.repositoryUrl || "storage-provision",
            repositoryFullName: project.repositoryFullName || null,
            targetBranch: project.targetBranch || "main",
            status: project_pipeline_run_entity_1.PipelineRunStatus.QUEUED,
            currentStage: "storage_provision_queued",
            metadata: { jobType: "storage_provision" },
        }));
        storage.pipelineRunId = run.id;
        await this.storageRepository.save(storage);
        await this.pipelineQueue.add("storage_provision", {
            pipelineRunId: run.id,
            projectId: project.id,
            triggeredByUserId: user.id,
            jobType: "storage_provision",
            options: {
                triggerGithubActions: false,
                buildImage: false,
                pushToEcr: false,
                runTerraform: true,
            },
        }, {
            attempts: Number(process.env.PIPELINE_JOB_ATTEMPTS || "1"),
            backoff: { type: "fixed", delay: 5000 },
        });
        await this.event(project.id, run.id, storage.id, "efs_provisioning_queued", "queued", "EFS provisioning queued.", user);
        await this.audit("EFS_PROVISIONING_QUEUED", project.id, user, "success", {
            pipelineRunId: run.id,
            storageId: storage.id,
        }, req);
        return { pipelineRunId: run.id, persistentStorageId: storage.id };
    }
    async getEvents(user, projectId) {
        const project = await this.findProjectForView(user, projectId);
        return this.eventRepository.find({
            where: { projectId: project.id },
            order: { createdAt: "ASC" },
        });
    }
    async getMountConfig(user, projectId) {
        const project = await this.findProjectForView(user, projectId);
        return this.efsService.getEfsMountInstructions(project.id);
    }
    async getBackups(user, projectId) {
        const project = await this.findProjectForView(user, projectId);
        return this.backupService.getBackupStatus(project.id);
    }
    async createRestoreRequest(user, projectId, dto, req) {
        const project = await this.findProjectForManage(user, projectId);
        const storage = dto.persistentStorageId
            ? await this.storageRepository.findOne({ where: { id: dto.persistentStorageId, projectId: project.id } })
            : await this.storageRepository.findOne({
                where: { projectId: project.id, environmentName: "dev" },
                order: { createdAt: "DESC" },
            });
        if (!storage) {
            throw new common_1.NotFoundException("Persistent storage configuration not found.");
        }
        const request = await this.backupService.createRestoreRequest(project.id, storage.id, dto.recoveryPointArn || null, user.id, dto.reason || null);
        await this.event(project.id, storage.pipelineRunId || null, storage.id, "restore_request_created", "queued", "Storage restore request created.", user, {
            restoreRequestId: request.id,
        });
        await this.audit("STORAGE_RESTORE_REQUEST_CREATED", project.id, user, "success", {
            storageId: storage.id,
            restoreRequestId: request.id,
        }, req);
        return request;
    }
    async recordStorageEvent(projectId, pipelineRunId, eventType, status, message, actorUser, metadata = {}) {
        const storage = await this.storageRepository.findOne({
            where: { projectId, environmentName: "dev" },
            order: { createdAt: "DESC" },
        });
        return this.event(projectId, pipelineRunId, storage?.id || null, eventType, status, message, actorUser || null, metadata);
    }
    async event(projectId, pipelineRunId, persistentStorageId, eventType, status, message, actorUser, metadata = {}) {
        return this.eventRepository.save(this.eventRepository.create({
            projectId,
            pipelineRunId,
            persistentStorageId,
            eventType,
            status,
            message,
            actorUserId: actorUser?.id || null,
            metadata: this.safeMetadata({
                projectId,
                pipelineRunId,
                persistentStorageId,
                eventType,
                status,
                ...metadata,
            }),
        }));
    }
    async audit(action, projectId, actorUser, status, metadata, req) {
        await this.auditLogService.record({
            actorUser,
            action,
            resourceType: "persistent_storage",
            resourceId: projectId,
            status,
            metadata: this.safeMetadata({ projectId, ...metadata }),
            req,
        });
    }
    async findProjectForView(user, projectId) {
        const project = await this.projectRepository.findOne({ where: { id: projectId } });
        if (!project || project.status === project_entity_1.ProjectStatus.ARCHIVED) {
            throw new common_1.NotFoundException("Project not found");
        }
        if (user.role === user_entity_1.UserRole.ADMIN ||
            project.ownerUserId === user.id ||
            (user.role === user_entity_1.UserRole.READONLY && project.visibility === project_entity_1.ProjectVisibility.WORKSPACE)) {
            return project;
        }
        throw new common_1.ForbiddenException("Insufficient permissions");
    }
    async findProjectForManage(user, projectId) {
        const project = await this.findProjectForView(user, projectId);
        if (user.role === user_entity_1.UserRole.READONLY) {
            throw new common_1.ForbiddenException("Insufficient permissions");
        }
        if (user.role === user_entity_1.UserRole.ADMIN || project.ownerUserId === user.id) {
            return project;
        }
        throw new common_1.ForbiddenException("Insufficient permissions");
    }
    safeMetadata(metadata) {
        const allowed = [
            "projectId",
            "pipelineRunId",
            "persistentStorageId",
            "storageId",
            "eventType",
            "status",
            "enabled",
            "backupEnabled",
            "requiredByDetection",
            "restoreRequestId",
            "efsFileSystemId",
            "efsAccessPointId",
            "backupPlanId",
            "backupVaultName",
            "reason",
        ];
        return Object.entries(metadata).reduce((safe, [key, value]) => {
            if (allowed.includes(key) && value !== undefined) {
                safe[key] = value;
            }
            return safe;
        }, {});
    }
};
exports.StorageService = StorageService;
exports.StorageService = StorageService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(project_entity_1.Project)),
    __param(1, (0, typeorm_1.InjectRepository)(project_pipeline_run_entity_1.ProjectPipelineRun)),
    __param(2, (0, typeorm_1.InjectRepository)(project_persistent_storage_entity_1.ProjectPersistentStorage)),
    __param(3, (0, typeorm_1.InjectRepository)(project_storage_event_entity_1.ProjectStorageEvent)),
    __param(4, (0, common_1.Inject)(pipeline_types_1.PIPELINE_QUEUE)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        bullmq_1.Queue,
        audit_log_service_1.AuditLogService,
        storage_policy_service_1.StoragePolicyService,
        efs_service_1.EfsService,
        backup_service_1.BackupService])
], StorageService);
//# sourceMappingURL=storage.service.js.map