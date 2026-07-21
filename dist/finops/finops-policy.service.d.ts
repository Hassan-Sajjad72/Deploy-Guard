import { ConfigService } from "@nestjs/config";
import { CostEstimateStatus, ProjectCostEstimate } from "./project-cost-estimate.entity";
import { SubscriptionTier } from "./project-cost-settings.entity";
export declare class FinopsPolicyService {
    private readonly config;
    constructor(config: ConfigService);
    tierLimit(tier: SubscriptionTier | string): number;
    evaluate(input: {
        totalMonthlyCost: number;
        warningThresholdMonthlyCost: number;
        subscriptionTier: SubscriptionTier | string;
    }): {
        status: CostEstimateStatus;
        approvalRequired: boolean;
        blockedByTierLimit: boolean;
        tierLimitMonthlyCost: number;
        upgradePromptMessage: string;
    };
    canApprove(estimate: ProjectCostEstimate): boolean;
    canReject(estimate: ProjectCostEstimate): boolean;
}
