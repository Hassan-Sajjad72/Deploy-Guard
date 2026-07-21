import { Project } from "../projects/project.entity";
import { User } from "../users/user.entity";
export declare enum SubscriptionTier {
    FREE = "free",
    STARTER = "starter",
    PRO = "pro",
    ENTERPRISE = "enterprise"
}
export declare class ProjectCostSettings {
    id: string;
    projectId: string;
    project: Project;
    subscriptionTier: SubscriptionTier;
    warningThresholdMonthlyCost: number;
    currency: string;
    updatedByUserId: number;
    updatedByUser: User;
    createdAt: Date;
    updatedAt: Date;
}
