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
exports.StateLockService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const project_deployment_queue_item_entity_1 = require("./project-deployment-queue-item.entity");
const project_terraform_lock_entity_1 = require("./project-terraform-lock.entity");
const state_management_config_1 = require("./state-management.config");
const ACTIVE_LOCK_STATUSES = [
    project_terraform_lock_entity_1.TerraformLockStatus.ACQUIRED,
    project_terraform_lock_entity_1.TerraformLockStatus.HEARTBEAT_ACTIVE,
];
let StateLockService = class StateLockService {
    constructor(lockRepository, queueRepository, config) {
        this.lockRepository = lockRepository;
        this.queueRepository = queueRepository;
        this.config = config;
        this.ownerWorkerId = `${process.pid}-${Date.now()}`;
    }
    buildLockId(projectId, environmentName = "dev") {
        return `project#${projectId}#environment#${environmentName}`;
    }
    async acquireLock(projectId, pipelineRunId, userId, environmentName = "dev", metadata = {}) {
        const lockId = this.buildLockId(projectId, environmentName);
        const existing = await this.lockRepository.findOne({ where: { lockId } });
        const config = (0, state_management_config_1.getStateManagementConfig)(this.config);
        const now = new Date();
        if (existing && ACTIVE_LOCK_STATUSES.includes(existing.status) && !this.isStale(existing)) {
            await this.enqueueBehindExistingLock(projectId, pipelineRunId, environmentName);
            return { acquired: false, lock: existing };
        }
        const lock = existing || this.lockRepository.create({ lockId, projectId, pipelineRunId, environmentName });
        lock.projectId = projectId;
        lock.pipelineRunId = pipelineRunId;
        lock.userId = userId;
        lock.status = project_terraform_lock_entity_1.TerraformLockStatus.ACQUIRED;
        lock.ownerWorkerId = this.ownerWorkerId;
        lock.acquiredAt = now;
        lock.heartbeatAt = now;
        lock.heartbeatIntervalSeconds = config.heartbeatIntervalSeconds;
        lock.staleAfterSeconds = config.staleAfterSeconds;
        lock.releasedAt = null;
        lock.forceReleasedAt = null;
        lock.metadata = metadata;
        return { acquired: true, lock: await this.lockRepository.save(lock) };
    }
    async releaseLock(lockId, pipelineRunId) {
        const lock = await this.getLock(lockId);
        if (!lock || lock.pipelineRunId !== pipelineRunId) {
            return null;
        }
        lock.status = project_terraform_lock_entity_1.TerraformLockStatus.RELEASED;
        lock.releasedAt = new Date();
        return this.lockRepository.save(lock);
    }
    async getLock(lockId) {
        return this.lockRepository.findOne({ where: { lockId } });
    }
    async markLockOrphaned(lockId) {
        const lock = await this.getLock(lockId);
        if (!lock)
            return null;
        lock.status = project_terraform_lock_entity_1.TerraformLockStatus.ORPHANED;
        return this.lockRepository.save(lock);
    }
    async forceReleaseOrphanedLock(lockId) {
        const config = (0, state_management_config_1.getStateManagementConfig)(this.config);
        const lock = await this.getLock(lockId);
        if (!lock || !config.forceReleaseEnabled) {
            return null;
        }
        if (lock.status !== project_terraform_lock_entity_1.TerraformLockStatus.ORPHANED && !this.isStale(lock)) {
            throw new Error("Only orphaned or stale locks can be force released.");
        }
        lock.status = project_terraform_lock_entity_1.TerraformLockStatus.FORCE_RELEASED;
        lock.forceReleasedAt = new Date();
        return this.lockRepository.save(lock);
    }
    async enqueueBehindExistingLock(projectId, pipelineRunId, environmentName = "dev") {
        const count = await this.queueRepository.count({
            where: { projectId, environmentName, status: project_deployment_queue_item_entity_1.DeploymentQueueStatus.WAITING_FOR_LOCK },
        });
        return this.queueRepository.save(this.queueRepository.create({
            projectId,
            pipelineRunId,
            environmentName,
            status: project_deployment_queue_item_entity_1.DeploymentQueueStatus.WAITING_FOR_LOCK,
            position: count + 1,
            reason: "Waiting for Terraform state lock.",
        }));
    }
    async getQueuedDeployments(projectId, environmentName = "dev") {
        return this.queueRepository.find({
            where: { projectId, environmentName },
            order: { position: "ASC", createdAt: "ASC" },
        });
    }
    async processNextQueuedDeployment(projectId, environmentName = "dev") {
        const next = await this.queueRepository.findOne({
            where: { projectId, environmentName, status: project_deployment_queue_item_entity_1.DeploymentQueueStatus.WAITING_FOR_LOCK },
            order: { position: "ASC", createdAt: "ASC" },
        });
        if (!next)
            return null;
        next.status = project_deployment_queue_item_entity_1.DeploymentQueueStatus.PROCESSING;
        next.startedAt = new Date();
        return this.queueRepository.save(next);
    }
    async activeLocks() {
        return this.lockRepository.find({ where: ACTIVE_LOCK_STATUSES.map((status) => ({ status })) });
    }
    isStale(lock) {
        const heartbeat = lock.heartbeatAt || lock.acquiredAt;
        const staleAfterMs = (lock.staleAfterSeconds || 300) * 1000;
        return Date.now() - new Date(heartbeat).getTime() > staleAfterMs;
    }
};
exports.StateLockService = StateLockService;
exports.StateLockService = StateLockService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(project_terraform_lock_entity_1.ProjectTerraformLock)),
    __param(1, (0, typeorm_1.InjectRepository)(project_deployment_queue_item_entity_1.ProjectDeploymentQueueItem)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        config_1.ConfigService])
], StateLockService);
//# sourceMappingURL=state-lock.service.js.map