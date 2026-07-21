"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStateManagementConfig = getStateManagementConfig;
function getStateManagementConfig(config) {
    return {
        bucket: config.get("DEPLOYGUARD_TF_STATE_BUCKET", ""),
        prefix: config.get("DEPLOYGUARD_TF_STATE_PREFIX", "deployguard/state"),
        lockTable: config.get("DEPLOYGUARD_TF_LOCK_TABLE", "deployguard-terraform-locks"),
        region: config.get("AWS_REGION", "us-east-1"),
        heartbeatIntervalSeconds: Number(config.get("STATE_LOCK_HEARTBEAT_INTERVAL_SECONDS", "30")),
        staleAfterSeconds: Number(config.get("STATE_LOCK_STALE_AFTER_SECONDS", "300")),
        monitorIntervalSeconds: Number(config.get("STATE_LOCK_MONITOR_INTERVAL_SECONDS", "60")),
        resourceDropWarningPercent: Number(config.get("STATE_RESOURCE_DROP_WARNING_PERCENT", "70")),
        orphanAutoRecovery: config.get("STATE_ENABLE_ORPHAN_AUTO_RECOVERY", "true") !== "false",
        forceReleaseEnabled: config.get("STATE_ENABLE_FORCE_RELEASE", "true") !== "false",
        mockMode: config.get("STATE_MOCK_MODE", "true") !== "false",
    };
}
//# sourceMappingURL=state-management.config.js.map