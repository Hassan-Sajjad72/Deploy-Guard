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
exports.StateManagementService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const audit_log_service_1 = require("../audit-log/audit-log.service");
const project_entity_1 = require("../projects/project.entity");
const user_entity_1 = require("../users/user.entity");
const project_deployment_queue_item_entity_1 = require("./project-deployment-queue-item.entity");
const project_state_recovery_request_entity_1 = require("./project-state-recovery-request.entity");
const project_state_validation_result_entity_1 = require("./project-state-validation-result.entity");
const project_terraform_lock_entity_1 = require("./project-terraform-lock.entity");
const project_terraform_state_entity_1 = require("./project-terraform-state.entity");
const state_corruption_service_1 = require("./state-corruption.service");
const state_lock_service_1 = require("./state-lock.service");
const state_recovery_service_1 = require("./state-recovery.service");
const terraform_state_service_1 = require("./terraform-state.service");
let StateManagementService = class StateManagementService {
    constructor(projectRepository, stateRepository, lockRepository, queueRepository, validationRepository, recoveryRepository, terraformStateService, lockService, corruptionService, recoveryService, auditLogService) {
        this.projectRepository = projectRepository;
        this.stateRepository = stateRepository;
        this.lockRepository = lockRepository;
        this.queueRepository = queueRepository;
        this.validationRepository = validationRepository;
        this.recoveryRepository = recoveryRepository;
        this.terraformStateService = terraformStateService;
        this.lockService = lockService;
        this.corruptionService = corruptionService;
        this.recoveryService = recoveryService;
        this.auditLogService = auditLogService;
    }
    async getState(user, projectId) {
        const project = await this.findProjectForView(user, projectId);
        const state = await this.stateRepository.findOne({
            where: { projectId: project.id, environmentName: "dev" },
        });
        return state ? this.toStateResponse(state) : null;
    }
    async getVersions(user, projectId) {
        const project = await this.findProjectForView(user, projectId);
        return this.terraformStateService.listStateVersions(project, "dev");
    }
    async getLocks(user, projectId) {
        const project = await this.findProjectForView(user, projectId);
        const lock = await this.lockRepository.findOne({
            where: { lockId: this.lockService.buildLockId(project.id, "dev") },
        });
        const queue = await this.queueRepository.find({
            where: { projectId: project.id },
            order: { position: "ASC", createdAt: "ASC" },
        });
        return { lock, queue };
    }
    async getValidationResults(user, projectId) {
        const project = await this.findProjectForView(user, projectId);
        return this.validationRepository.find({
            where: { projectId: project.id },
            order: { createdAt: "DESC" },
            take: 50,
        });
    }
    async validate(user, projectId) {
        const project = await this.findProjectForManage(user, projectId);
        await this.audit("STATE_VALIDATION_STARTED", project.id, user, "success");
        const state = await this.stateRepository.findOne({
            where: { projectId: project.id, environmentName: "dev" },
        });
        const result = await this.corruptionService.detectCorruption(project.id, "dev", state ? JSON.stringify({ version: 4, serial: 1, resources: [] }) : "{}");
        await this.audit(result.status === "valid" ? "STATE_VALIDATION_PASSED" : "STATE_VALIDATION_FAILED", project.id, user, result.status === "valid" ? "success" : "failed", { validationResultId: result.id, status: result.status });
        return result;
    }
    async recover(user, projectId, dto) {
        const project = await this.findProjectForManage(user, projectId);
        const versionId = String(dto.versionId || "");
        if (!versionId) {
            throw new Error("versionId is required.");
        }
        const recovery = await this.recoveryService.restorePreviousVersion(project.id, "dev", versionId, user.id);
        await this.audit("STATE_VERSION_RESTORED", project.id, user, "success", {
            recoveryRequestId: recovery.id,
        });
        return recovery;
    }
    async forceRelease(user, projectId, lockId) {
        const project = await this.findProjectForView(user, projectId);
        if (user.role !== user_entity_1.UserRole.ADMIN) {
            throw new common_1.ForbiddenException("Only admins can force release state locks.");
        }
        const lock = await this.lockService.forceReleaseOrphanedLock(lockId);
        await this.audit("STATE_LOCK_FORCE_RELEASED", project.id, user, "success", {
            lockId,
        });
        return lock;
    }
    async recoveryRequests(user, projectId) {
        const project = await this.findProjectForView(user, projectId);
        return this.recoveryRepository.find({
            where: { projectId: project.id },
            order: { createdAt: "DESC" },
            take: 50,
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
    async audit(action, projectId, actorUser, status, metadata = {}) {
        await this.auditLogService.record({
            actorUser,
            action,
            resourceType: "terraform_state",
            resourceId: projectId,
            status,
            metadata: {
                projectId,
                ...metadata,
            },
        });
    }
    toStateResponse(state) {
        return {
            id: state.id,
            projectId: state.projectId,
            environmentName: state.environmentName,
            stateBucket: state.stateBucket,
            stateKey: state.stateKey,
            stateRegion: state.stateRegion,
            currentVersionId: state.currentVersionId,
            previousVersionId: state.previousVersionId,
            checksum: state.checksum,
            resourceCount: state.resourceCount,
            dependencyGraphHash: state.dependencyGraphHash,
            status: state.status,
            lastValidatedAt: state.lastValidatedAt,
            createdAt: state.createdAt,
            updatedAt: state.updatedAt,
        };
    }
};
exports.StateManagementService = StateManagementService;
exports.StateManagementService = StateManagementService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(project_entity_1.Project)),
    __param(1, (0, typeorm_1.InjectRepository)(project_terraform_state_entity_1.ProjectTerraformState)),
    __param(2, (0, typeorm_1.InjectRepository)(project_terraform_lock_entity_1.ProjectTerraformLock)),
    __param(3, (0, typeorm_1.InjectRepository)(project_deployment_queue_item_entity_1.ProjectDeploymentQueueItem)),
    __param(4, (0, typeorm_1.InjectRepository)(project_state_validation_result_entity_1.ProjectStateValidationResult)),
    __param(5, (0, typeorm_1.InjectRepository)(project_state_recovery_request_entity_1.ProjectStateRecoveryRequest)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        terraform_state_service_1.TerraformStateService,
        state_lock_service_1.StateLockService,
        state_corruption_service_1.StateCorruptionService,
        state_recovery_service_1.StateRecoveryService,
        audit_log_service_1.AuditLogService])
], StateManagementService);
//# sourceMappingURL=state-management.service.js.map