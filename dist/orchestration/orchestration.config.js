"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOrchestrationConfig = getOrchestrationConfig;
function getOrchestrationConfig(config) {
    return {
        useFargateSpot: config.get("DEPLOYGUARD_ECS_USE_FARGATE_SPOT", "true") !== "false",
        enableFargateFallback: config.get("DEPLOYGUARD_ECS_ENABLE_FARGATE_FALLBACK", "false") === "true",
        minTasks: Number(config.get("DEPLOYGUARD_ECS_MIN_TASKS", "1")),
        maxTasks: Number(config.get("DEPLOYGUARD_ECS_MAX_TASKS", "3")),
        cpuTargetPercent: Number(config.get("DEPLOYGUARD_ECS_CPU_TARGET_PERCENT", "60")),
        defaultCpu: Number(config.get("DEPLOYGUARD_ECS_DEFAULT_CPU", "256")),
        defaultMemory: Number(config.get("DEPLOYGUARD_ECS_DEFAULT_MEMORY", "512")),
        largeCpu: Number(config.get("DEPLOYGUARD_ECS_LARGE_CPU", "512")),
        largeMemory: Number(config.get("DEPLOYGUARD_ECS_LARGE_MEMORY", "1024")),
        healthcheckGraceSeconds: Number(config.get("DEPLOYGUARD_ECS_HEALTHCHECK_GRACE_SECONDS", "60")),
        defaultHealthCheckPath: config.get("DEPLOYGUARD_ALB_HEALTHCHECK_PATH", "/health"),
        allowHealthcheckFallback: config.get("DEPLOYGUARD_ALLOW_HEALTHCHECK_FALLBACK", "false") === "true",
        rollbackStabilityTimeoutSeconds: Number(config.get("DEPLOYGUARD_ROLLBACK_STABILITY_TIMEOUT_SECONDS", "600")),
        serviceStabilityTimeoutSeconds: Number(config.get("DEPLOYGUARD_SERVICE_STABILITY_TIMEOUT_SECONDS", "600")),
        serviceStabilityPollIntervalSeconds: Number(config.get("DEPLOYGUARD_SERVICE_STABILITY_POLL_INTERVAL_SECONDS", "15")),
        albHealthTimeoutSeconds: Number(config.get("DEPLOYGUARD_ALB_HEALTH_TIMEOUT_SECONDS", "600")),
        albHealthPollIntervalSeconds: Number(config.get("DEPLOYGUARD_ALB_HEALTH_POLL_INTERVAL_SECONDS", "15")),
        spotEventWebhookSecret: config.get("DEPLOYGUARD_SPOT_EVENT_WEBHOOK_SECRET", ""),
        enableEventBridgeSpotRule: config.get("DEPLOYGUARD_ENABLE_EVENTBRIDGE_SPOT_RULE", "true") !== "false",
        enableAutoRollback: config.get("DEPLOYGUARD_ENABLE_AUTO_ROLLBACK", "true") !== "false",
        spotRecoveryCooldownSeconds: Number(config.get("DEPLOYGUARD_SPOT_RECOVERY_COOLDOWN_SECONDS", "120")),
        containerInsights: config.get("DEPLOYGUARD_ECS_CONTAINER_INSIGHTS", "false") === "true",
    };
}
//# sourceMappingURL=orchestration.config.js.map