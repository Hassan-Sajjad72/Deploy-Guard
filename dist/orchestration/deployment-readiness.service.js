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
exports.OrchestrationDeploymentReadinessService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const project_cost_estimate_entity_1 = require("../finops/project-cost-estimate.entity");
const project_infrastructure_environment_entity_1 = require("../infrastructure/project-infrastructure-environment.entity");
const project_security_scan_entity_1 = require("../projects/project-security-scan.entity");
const project_terraform_state_entity_1 = require("../state-management/project-terraform-state.entity");
const project_persistent_storage_entity_1 = require("../storage/project-persistent-storage.entity");
let OrchestrationDeploymentReadinessService = class OrchestrationDeploymentReadinessService {
    constructor(costRepository, environmentRepository, scanRepository, stateRepository, storageRepository) {
        this.costRepository = costRepository;
        this.environmentRepository = environmentRepository;
        this.scanRepository = scanRepository;
        this.stateRepository = stateRepository;
        this.storageRepository = storageRepository;
    }
    isReadyForEcsDeployment(run) {
        return Boolean(run.ecrImageUri && run.commitSha && /^[0-9a-f]{40}$/i.test(run.commitSha));
    }
    verifyEcrImageExists(run) {
        return {
            passed: this.isReadyForEcsDeployment(run),
            reason: this.isReadyForEcsDeployment(run)
                ? null
                : "ECR image URI and full commit SHA are required before ECS deployment.",
        };
    }
    async verifyInfrastructureProvisioned(projectId) {
        const environment = await this.environmentRepository.findOne({
            where: { projectId },
            order: { createdAt: "DESC" },
        });
        const passed = environment?.status === project_infrastructure_environment_entity_1.InfrastructureEnvironmentStatus.PROVISIONED;
        return {
            passed,
            reason: passed ? null : "Infrastructure must be provisioned before ECS deployment.",
            environment,
        };
    }
    async verifyCostGatePassed(projectId) {
        const estimate = await this.costRepository.findOne({
            where: { projectId },
            order: { createdAt: "DESC" },
        });
        const passed = Boolean(estimate &&
            [project_cost_estimate_entity_1.CostEstimateStatus.NO_APPROVAL_REQUIRED, project_cost_estimate_entity_1.CostEstimateStatus.APPROVED].includes(estimate.status));
        return {
            passed,
            reason: passed ? null : "FinOps cost gate must pass before ECS deployment.",
            estimate,
        };
    }
    async verifySecurityGatePassed(projectId, pipelineRunId) {
        const scan = await this.scanRepository.findOne({
            where: pipelineRunId ? { projectId, pipelineRunId } : { projectId },
            order: { createdAt: "DESC" },
        });
        const passed = Boolean(scan &&
            [project_security_scan_entity_1.SecurityPolicyDecision.ALLOWED, project_security_scan_entity_1.SecurityPolicyDecision.APPROVED_OVERRIDE].includes(scan.policyDecision));
        return {
            passed,
            reason: passed ? null : "Security scan gate must pass before ECS deployment.",
            scan,
        };
    }
    async verifyStateLockSafe(projectId) {
        const state = await this.stateRepository.findOne({
            where: { projectId },
            order: { createdAt: "DESC" },
        });
        const passed = !state || [project_terraform_state_entity_1.TerraformStateStatus.ACTIVE, project_terraform_state_entity_1.TerraformStateStatus.RECOVERED].includes(state.status);
        return {
            passed,
            reason: passed ? null : "Terraform state must be active or recovered before ECS deployment.",
            state,
        };
    }
    async verifyEfsMountConfigIfNeeded(projectId) {
        const storage = await this.storageRepository.findOne({
            where: { projectId, environmentName: "dev" },
            order: { createdAt: "DESC" },
        });
        const needed = Boolean(storage?.enabled);
        const passed = !needed || Boolean(storage?.efsFileSystemId && storage?.efsAccessPointId);
        return {
            passed,
            reason: passed ? null : "Enabled EFS storage must have filesystem and access point outputs before ECS deployment.",
            storage,
        };
    }
    async getBlockingReasons(run) {
        const checks = [
            this.verifyEcrImageExists(run),
            await this.verifyInfrastructureProvisioned(run.projectId),
            await this.verifyCostGatePassed(run.projectId),
            await this.verifySecurityGatePassed(run.projectId, run.id),
            await this.verifyStateLockSafe(run.projectId),
            await this.verifyEfsMountConfigIfNeeded(run.projectId),
        ];
        return checks
            .filter((check) => !check.passed)
            .map((check) => check.reason)
            .filter(Boolean);
    }
};
exports.OrchestrationDeploymentReadinessService = OrchestrationDeploymentReadinessService;
exports.OrchestrationDeploymentReadinessService = OrchestrationDeploymentReadinessService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(project_cost_estimate_entity_1.ProjectCostEstimate)),
    __param(1, (0, typeorm_1.InjectRepository)(project_infrastructure_environment_entity_1.ProjectInfrastructureEnvironment)),
    __param(2, (0, typeorm_1.InjectRepository)(project_security_scan_entity_1.ProjectSecurityScan)),
    __param(3, (0, typeorm_1.InjectRepository)(project_terraform_state_entity_1.ProjectTerraformState)),
    __param(4, (0, typeorm_1.InjectRepository)(project_persistent_storage_entity_1.ProjectPersistentStorage)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], OrchestrationDeploymentReadinessService);
//# sourceMappingURL=deployment-readiness.service.js.map