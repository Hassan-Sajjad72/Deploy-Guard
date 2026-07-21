import { ConfigService } from "@nestjs/config";
import { SecurityPolicyDecision, ProjectSecurityScan } from "../project-security-scan.entity";
export declare class SecurityPolicyService {
    private readonly config;
    constructor(config: ConfigService);
    evaluate(counts: {
        critical: number;
        high: number;
        medium: number;
        low: number;
        unknown: number;
    }): {
        policyDecision: SecurityPolicyDecision;
        policyReason: string;
        manualApprovalRequired: boolean;
    };
    canApprove(scan: ProjectSecurityScan): boolean;
}
