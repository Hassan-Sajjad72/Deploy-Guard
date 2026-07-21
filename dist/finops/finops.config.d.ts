import { ConfigService } from "@nestjs/config";
import { SubscriptionTier } from "./project-cost-settings.entity";
export type FinopsConfig = {
    mockMode: boolean;
    currency: string;
    defaultWarningThreshold: number;
    tierLimits: Record<SubscriptionTier, number>;
    terraformWorkdir: string | null;
    enableRealTerraform: boolean;
};
export declare function getFinopsConfig(config: ConfigService): FinopsConfig;
