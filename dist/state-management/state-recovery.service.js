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
exports.StateRecoveryService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const project_entity_1 = require("../projects/project.entity");
const project_state_recovery_request_entity_1 = require("./project-state-recovery-request.entity");
const project_terraform_state_entity_1 = require("./project-terraform-state.entity");
const terraform_state_service_1 = require("./terraform-state.service");
let StateRecoveryService = class StateRecoveryService {
    constructor(projectRepository, recoveryRepository, terraformStateService) {
        this.projectRepository = projectRepository;
        this.recoveryRepository = recoveryRepository;
        this.terraformStateService = terraformStateService;
    }
    async listRecoverableVersions(projectId, environmentName = "dev") {
        const project = await this.requireProject(projectId);
        return this.terraformStateService.listStateVersions(project, environmentName);
    }
    async createRecoveryPrompt(projectId, versionId, userId, reason) {
        return this.recoveryRepository.save(this.recoveryRepository.create({
            projectId,
            environmentName: "dev",
            recoveryVersionId: versionId,
            requestedByUserId: userId || null,
            reason: reason || "Restore previous valid state.",
            status: project_state_recovery_request_entity_1.StateRecoveryStatus.PENDING,
        }));
    }
    async restorePreviousVersion(projectId, environmentName, versionId, userId) {
        const project = await this.requireProject(projectId);
        await this.terraformStateService.restoreStateVersion(project, environmentName, versionId);
        const request = await this.createRecoveryPrompt(projectId, versionId, userId, "State version restored.");
        request.status = project_state_recovery_request_entity_1.StateRecoveryStatus.COMPLETED;
        request.approvedByUserId = userId || null;
        request.completedAt = new Date();
        await this.terraformStateService.upsertStateMetadata({
            project,
            environmentName,
            versionId,
            status: project_terraform_state_entity_1.TerraformStateStatus.RECOVERED,
        });
        return this.recoveryRepository.save(request);
    }
    async markRecoveryDecision(projectId, decision, userId) {
        const request = await this.recoveryRepository.findOne({
            where: { projectId, status: project_state_recovery_request_entity_1.StateRecoveryStatus.PENDING },
            order: { createdAt: "DESC" },
        });
        if (!request) {
            return null;
        }
        request.status = decision === "approved" ? project_state_recovery_request_entity_1.StateRecoveryStatus.APPROVED : project_state_recovery_request_entity_1.StateRecoveryStatus.REJECTED;
        request.approvedByUserId = userId || null;
        return this.recoveryRepository.save(request);
    }
    async recoveryRequests(projectId) {
        return this.recoveryRepository.find({
            where: { projectId },
            order: { createdAt: "DESC" },
            take: 50,
        });
    }
    async requireProject(projectId) {
        const project = await this.projectRepository.findOne({ where: { id: projectId } });
        if (!project) {
            throw new Error("Project not found.");
        }
        return project;
    }
};
exports.StateRecoveryService = StateRecoveryService;
exports.StateRecoveryService = StateRecoveryService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(project_entity_1.Project)),
    __param(1, (0, typeorm_1.InjectRepository)(project_state_recovery_request_entity_1.ProjectStateRecoveryRequest)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        terraform_state_service_1.TerraformStateService])
], StateRecoveryService);
//# sourceMappingURL=state-recovery.service.js.map