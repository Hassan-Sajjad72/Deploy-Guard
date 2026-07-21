import { ConfigService } from "@nestjs/config";
export type SecurityPolicyConfig = {
    blockCritical: boolean;
    blockHigh: boolean;
    mediumThresholdForApproval: number;
    lowBlocking: boolean;
    allowManualOverrideForHighCritical: boolean;
    allowManualApprovalForMedium: boolean;
};
export declare function getSecurityPolicyConfig(config: ConfigService): SecurityPolicyConfig;
