"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSecurityPolicyConfig = getSecurityPolicyConfig;
function bool(value, defaultValue) {
    if (value === undefined || value === "") {
        return defaultValue;
    }
    return value === "true";
}
function getSecurityPolicyConfig(config) {
    return {
        blockCritical: bool(config.get("SECURITY_BLOCK_CRITICAL"), true),
        blockHigh: bool(config.get("SECURITY_BLOCK_HIGH"), true),
        mediumThresholdForApproval: Number(config.get("SECURITY_MEDIUM_APPROVAL_THRESHOLD", "5")),
        lowBlocking: bool(config.get("SECURITY_LOW_BLOCKING"), false),
        allowManualOverrideForHighCritical: bool(config.get("SECURITY_ALLOW_HIGH_CRITICAL_OVERRIDE"), false),
        allowManualApprovalForMedium: bool(config.get("SECURITY_ALLOW_MEDIUM_APPROVAL"), true),
    };
}
//# sourceMappingURL=security-policy.config.js.map