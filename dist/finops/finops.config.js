"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFinopsConfig = getFinopsConfig;
const project_cost_settings_entity_1 = require("./project-cost-settings.entity");
function getFinopsConfig(config) {
    return {
        mockMode: config.get("FINOPS_MOCK_MODE", "true") !== "false",
        currency: config.get("INFRACOST_CURRENCY", "USD"),
        defaultWarningThreshold: Number(config.get("FINOPS_DEFAULT_WARNING_THRESHOLD_USD", "25")),
        tierLimits: {
            [project_cost_settings_entity_1.SubscriptionTier.FREE]: Number(config.get("FINOPS_FREE_TIER_LIMIT_USD", "10")),
            [project_cost_settings_entity_1.SubscriptionTier.STARTER]: Number(config.get("FINOPS_STARTER_TIER_LIMIT_USD", "50")),
            [project_cost_settings_entity_1.SubscriptionTier.PRO]: Number(config.get("FINOPS_PRO_TIER_LIMIT_USD", "200")),
            [project_cost_settings_entity_1.SubscriptionTier.ENTERPRISE]: Number(config.get("FINOPS_ENTERPRISE_TIER_LIMIT_USD", "999999")),
        },
        terraformWorkdir: config.get("FINOPS_TERRAFORM_WORKDIR") || null,
        enableRealTerraform: config.get("FINOPS_ENABLE_REAL_TERRAFORM", "false") === "true",
    };
}
//# sourceMappingURL=finops.config.js.map