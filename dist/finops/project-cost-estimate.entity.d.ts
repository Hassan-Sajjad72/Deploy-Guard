import { ProjectPipelineRun } from "../projects/project-pipeline-run.entity";
import { Project } from "../projects/project.entity";
import { User } from "../users/user.entity";
import { ProjectCostResourceBreakdown } from "./project-cost-resource-breakdown.entity";
export declare enum CostEstimateStatus {
    PENDING = "pending",
    CALCULATING = "calculating",
    NO_APPROVAL_REQUIRED = "no_approval_required",
    APPROVAL_REQUIRED = "approval_required",
    APPROVED = "approved",
    REJECTED = "rejected",
    BLOCKED_BY_TIER_LIMIT = "blocked_by_tier_limit",
    FAILED = "failed"
}
export declare enum CostEstimateSource {
    MOCK = "mock",
    INFRACOST = "infracost"
}
export declare class ProjectCostEstimate {
    id: string;
    projectId: string;
    project: Project;
    pipelineRunId: string;
    pipelineRun: ProjectPipelineRun;
    createdByUserId: number;
    createdByUser: User;
    status: CostEstimateStatus;
    source: CostEstimateSource;
    currency: string;
    totalMonthlyCost: number;
    previousMonthlyCost: number;
    monthlyCostDifference: number;
    tierLimitMonthlyCost: number;
    warningThresholdMonthlyCost: number;
    subscriptionTier: string;
    approvalRequired: boolean;
    blockedByTierLimit: boolean;
    upgradePromptMessage: string;
    terraformPlanSummary: Record<string, unknown> | null;
    rawInfracostResponse: Record<string, unknown> | null;
    normalizedBreakdown: Record<string, unknown> | null;
    metadata: Record<string, unknown> | null;
    errorMessage: string;
    approvedByUserId: number;
    approvedAt: Date;
    rejectedByUserId: number;
    rejectedAt: Date;
    rejectionReason: string;
    breakdowns: ProjectCostResourceBreakdown[];
    createdAt: Date;
    updatedAt: Date;
}
