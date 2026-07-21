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
exports.StateCorruptionService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const crypto_1 = require("crypto");
const typeorm_2 = require("typeorm");
const project_state_validation_result_entity_1 = require("./project-state-validation-result.entity");
const project_terraform_state_entity_1 = require("./project-terraform-state.entity");
const state_management_config_1 = require("./state-management.config");
const terraform_state_service_1 = require("./terraform-state.service");
let StateCorruptionService = class StateCorruptionService {
    constructor(resultRepository, stateRepository, config, terraformStateService) {
        this.resultRepository = resultRepository;
        this.stateRepository = stateRepository;
        this.config = config;
        this.terraformStateService = terraformStateService;
    }
    validateTerraformStateJson(stateJson) {
        try {
            const parsed = JSON.parse(stateJson || "{}");
            return Boolean(typeof parsed.version === "number" &&
                typeof parsed.serial === "number" &&
                Array.isArray(parsed.resources));
        }
        catch {
            return false;
        }
    }
    validateChecksum(stateJson, expectedChecksum) {
        if (!expectedChecksum) {
            return true;
        }
        return this.sha256(stateJson) === expectedChecksum;
    }
    validateResourceCountConsistency(resourceCount, previousResourceCount) {
        if (!previousResourceCount || previousResourceCount <= 0) {
            return true;
        }
        const config = (0, state_management_config_1.getStateManagementConfig)(this.config);
        const dropPercent = ((previousResourceCount - resourceCount) / previousResourceCount) * 100;
        return dropPercent <= config.resourceDropWarningPercent;
    }
    validateDependencyGraph(stateJson) {
        try {
            const parsed = JSON.parse(stateJson || "{}");
            const resources = parsed.resources || [];
            const resourceNames = new Set(resources.map((resource) => `${resource.mode || "managed"}.${resource.type}.${resource.name}`));
            for (const resource of resources) {
                for (const instance of resource.instances || []) {
                    for (const dependency of instance.dependencies || []) {
                        const normalized = dependency.split("[")[0];
                        if (normalized.includes(".") && !resourceNames.has(normalized)) {
                            return false;
                        }
                    }
                }
            }
            return true;
        }
        catch {
            return false;
        }
    }
    async detectCorruption(projectId, environmentName = "dev", rawState) {
        const state = await this.stateRepository.findOne({ where: { projectId, environmentName } });
        const stateJson = rawState || "{}";
        const parsed = this.safeParse(stateJson);
        const resourceCount = Array.isArray(parsed.resources) ? parsed.resources.length : 0;
        const actualChecksum = this.sha256(stateJson);
        const jsonSchemaValid = this.validateTerraformStateJson(stateJson);
        const checksumValid = this.validateChecksum(stateJson, state?.checksum);
        const resourceCountValid = this.validateResourceCountConsistency(resourceCount, state?.resourceCount);
        const dependencyGraphValid = this.validateDependencyGraph(stateJson);
        const issues = [
            !jsonSchemaValid ? "Terraform state JSON schema is invalid." : null,
            !checksumValid ? "Terraform state checksum does not match the last known checksum." : null,
            !resourceCountValid ? "Terraform state resource count dropped beyond configured threshold." : null,
            !dependencyGraphValid ? "Terraform state dependency graph has missing references." : null,
        ].filter(Boolean);
        const status = issues.length > 0 ? project_state_validation_result_entity_1.StateValidationStatus.CORRUPTED : project_state_validation_result_entity_1.StateValidationStatus.VALID;
        const result = await this.resultRepository.save(this.resultRepository.create({
            projectId,
            environmentName,
            stateVersionId: state?.currentVersionId || null,
            status,
            jsonSchemaValid,
            checksumValid,
            resourceCountValid,
            dependencyGraphValid,
            resourceCount,
            expectedChecksum: state?.checksum || null,
            actualChecksum,
            issues,
        }));
        if (state) {
            state.status =
                status === project_state_validation_result_entity_1.StateValidationStatus.CORRUPTED
                    ? project_terraform_state_entity_1.TerraformStateStatus.RECOVERY_REQUIRED
                    : project_terraform_state_entity_1.TerraformStateStatus.ACTIVE;
            state.lastValidatedAt = new Date();
            state.resourceCount = resourceCount;
            state.checksum = actualChecksum;
            state.dependencyGraphHash = this.dependencyGraphHash(stateJson);
            await this.stateRepository.save(state);
        }
        return result;
    }
    async validationResults(projectId, environmentName = "dev") {
        return this.resultRepository.find({
            where: { projectId, environmentName },
            order: { createdAt: "DESC" },
            take: 50,
        });
    }
    dependencyGraphHash(stateJson) {
        const parsed = this.safeParse(stateJson);
        const dependencies = (parsed.resources || []).flatMap((resource) => (resource.instances || []).flatMap((instance) => instance.dependencies || []));
        return this.sha256(JSON.stringify(dependencies.sort()));
    }
    safeParse(value) {
        try {
            return JSON.parse(value || "{}");
        }
        catch {
            return {};
        }
    }
    sha256(value) {
        return (0, crypto_1.createHash)("sha256").update(value).digest("hex");
    }
};
exports.StateCorruptionService = StateCorruptionService;
exports.StateCorruptionService = StateCorruptionService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(project_state_validation_result_entity_1.ProjectStateValidationResult)),
    __param(1, (0, typeorm_1.InjectRepository)(project_terraform_state_entity_1.ProjectTerraformState)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        config_1.ConfigService,
        terraform_state_service_1.TerraformStateService])
], StateCorruptionService);
//# sourceMappingURL=state-corruption.service.js.map