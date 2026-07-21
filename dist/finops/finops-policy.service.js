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
Object.defineProperty(exports, "__esModule", { value: true });
exports.FinopsPolicyService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const project_cost_estimate_entity_1 = require("./project-cost-estimate.entity");
const finops_config_1 = require("./finops.config");
let FinopsPolicyService = class FinopsPolicyService {
    constructor(config) {
        this.config = config;
    }
    tierLimit(tier) {
        const finopsConfig = (0, finops_config_1.getFinopsConfig)(this.config);
        return finopsConfig.tierLimits[tier] ?? finopsConfig.tierLimits.free;
    }
    evaluate(input) {
        const tierLimitMonthlyCost = this.tierLimit(input.subscriptionTier);
        if (input.totalMonthlyCost > tierLimitMonthlyCost) {
            return {
                status: project_cost_estimate_entity_1.CostEstimateStatus.BLOCKED_BY_TIER_LIMIT,
                approvalRequired: false,
                blockedByTierLimit: true,
                tierLimitMonthlyCost,
                upgradePromptMessage: `Estimated monthly cost exceeds the ${input.subscriptionTier} tier limit. Upgrade required before provisioning.`,
            };
        }
        if (input.totalMonthlyCost > input.warningThresholdMonthlyCost) {
            return {
                status: project_cost_estimate_entity_1.CostEstimateStatus.APPROVAL_REQUIRED,
                approvalRequired: true,
                blockedByTierLimit: false,
                tierLimitMonthlyCost,
                upgradePromptMessage: null,
            };
        }
        return {
            status: project_cost_estimate_entity_1.CostEstimateStatus.NO_APPROVAL_REQUIRED,
            approvalRequired: false,
            blockedByTierLimit: false,
            tierLimitMonthlyCost,
            upgradePromptMessage: null,
        };
    }
    canApprove(estimate) {
        return estimate.status === project_cost_estimate_entity_1.CostEstimateStatus.APPROVAL_REQUIRED;
    }
    canReject(estimate) {
        return estimate.status === project_cost_estimate_entity_1.CostEstimateStatus.APPROVAL_REQUIRED;
    }
};
exports.FinopsPolicyService = FinopsPolicyService;
exports.FinopsPolicyService = FinopsPolicyService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], FinopsPolicyService);
//# sourceMappingURL=finops-policy.service.js.map