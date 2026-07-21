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
exports.StateHeartbeatService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const project_terraform_lock_entity_1 = require("./project-terraform-lock.entity");
let StateHeartbeatService = class StateHeartbeatService {
    constructor(lockRepository) {
        this.lockRepository = lockRepository;
        this.timers = new Map();
    }
    async startHeartbeat(lockId, pipelineRunId) {
        await this.updateHeartbeat(lockId, pipelineRunId);
        const lock = await this.lockRepository.findOne({ where: { lockId } });
        const intervalSeconds = lock?.heartbeatIntervalSeconds || 30;
        const timer = setInterval(() => {
            this.updateHeartbeat(lockId, pipelineRunId).catch(() => undefined);
        }, intervalSeconds * 1000);
        this.timers.set(lockId, timer);
    }
    async updateHeartbeat(lockId, pipelineRunId) {
        const lock = await this.lockRepository.findOne({ where: { lockId } });
        if (!lock || lock.pipelineRunId !== pipelineRunId) {
            return null;
        }
        lock.status = project_terraform_lock_entity_1.TerraformLockStatus.HEARTBEAT_ACTIVE;
        lock.heartbeatAt = new Date();
        return this.lockRepository.save(lock);
    }
    async stopHeartbeat(lockId, pipelineRunId) {
        const timer = this.timers.get(lockId);
        if (timer) {
            clearInterval(timer);
            this.timers.delete(lockId);
        }
        return this.updateHeartbeat(lockId, pipelineRunId);
    }
    async onModuleDestroy() {
        for (const timer of this.timers.values()) {
            clearInterval(timer);
        }
        this.timers.clear();
    }
};
exports.StateHeartbeatService = StateHeartbeatService;
exports.StateHeartbeatService = StateHeartbeatService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(project_terraform_lock_entity_1.ProjectTerraformLock)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], StateHeartbeatService);
//# sourceMappingURL=state-heartbeat.service.js.map