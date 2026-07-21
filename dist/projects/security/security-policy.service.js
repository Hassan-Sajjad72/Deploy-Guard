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
exports.SecurityPolicyService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const project_security_scan_entity_1 = require("../project-security-scan.entity");
const security_policy_config_1 = require("./security-policy.config");
let SecurityPolicyService = class SecurityPolicyService {
    constructor(config) {
        this.config = config;
    }
    evaluate(counts) {
        const policy = (0, security_policy_config_1.getSecurityPolicyConfig)(this.config);
        if (policy.blockCritical && counts.critical > 0) {
            return {
                policyDecision: project_security_scan_entity_1.SecurityPolicyDecision.BLOCKED,
                policyReason: "Critical vulnerabilities found.",
                manualApprovalRequired: false,
            };
        }
        if (policy.blockHigh && counts.high > 0) {
            return {
                policyDecision: project_security_scan_entity_1.SecurityPolicyDecision.BLOCKED,
                policyReason: "High severity vulnerabilities found.",
                manualApprovalRequired: false,
            };
        }
        if (policy.allowManualApprovalForMedium &&
            counts.medium > policy.mediumThresholdForApproval) {
            return {
                policyDecision: project_security_scan_entity_1.SecurityPolicyDecision.REQUIRES_APPROVAL,
                policyReason: "Medium vulnerabilities exceed approval threshold.",
                manualApprovalRequired: true,
            };
        }
        if (policy.lowBlocking && counts.low > 0) {
            return {
                policyDecision: project_security_scan_entity_1.SecurityPolicyDecision.BLOCKED,
                policyReason: "Low severity vulnerabilities are blocked by policy.",
                manualApprovalRequired: false,
            };
        }
        return {
            policyDecision: project_security_scan_entity_1.SecurityPolicyDecision.ALLOWED,
            policyReason: "Scan passed policy.",
            manualApprovalRequired: false,
        };
    }
    canApprove(scan) {
        const policy = (0, security_policy_config_1.getSecurityPolicyConfig)(this.config);
        if (scan.policyDecision === project_security_scan_entity_1.SecurityPolicyDecision.REQUIRES_APPROVAL) {
            return policy.allowManualApprovalForMedium;
        }
        if (scan.policyDecision === project_security_scan_entity_1.SecurityPolicyDecision.BLOCKED &&
            (scan.criticalCount > 0 || scan.highCount > 0)) {
            return policy.allowManualOverrideForHighCritical;
        }
        return false;
    }
};
exports.SecurityPolicyService = SecurityPolicyService;
exports.SecurityPolicyService = SecurityPolicyService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], SecurityPolicyService);
//# sourceMappingURL=security-policy.service.js.map