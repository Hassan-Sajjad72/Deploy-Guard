"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getInfrastructureConfig = getInfrastructureConfig;
const path_1 = require("path");
function getInfrastructureConfig(config) {
    return {
        awsRegion: config.get("AWS_REGION", "us-east-1"),
        terraformBin: config.get("TERRAFORM_BIN", "terraform"),
        terraformWorkingBaseDir: (0, path_1.resolve)(process.cwd(), config.get("TERRAFORM_WORKING_BASE_DIR", "./.deployguard/terraform-workspaces")),
        terraformNetworkTemplateDir: (0, path_1.resolve)(process.cwd(), config.get("TERRAFORM_NETWORK_TEMPLATE_DIR", "terraform/base-network")),
        terraformAutoApprove: config.get("TERRAFORM_AUTO_APPROVE", "true") === "true",
        terraformApplyEnabled: config.get("TERRAFORM_APPLY_ENABLED", "false") === "true",
        defaultVpcCidr: config.get("DEPLOYGUARD_DEFAULT_VPC_CIDR", "10.0.0.0/16"),
        publicSubnetCidrs: splitCsv(config.get("DEPLOYGUARD_PUBLIC_SUBNET_CIDRS", "10.0.1.0/24,10.0.2.0/24")),
        privateSubnetCidrs: splitCsv(config.get("DEPLOYGUARD_PRIVATE_SUBNET_CIDRS", "10.0.101.0/24,10.0.102.0/24")),
        singleNatGateway: config.get("DEPLOYGUARD_SINGLE_NAT_GATEWAY", "true") !== "false",
        cloudMapNamespace: config.get("DEPLOYGUARD_CLOUDMAP_NAMESPACE", "deployguard.local"),
        enableHttps: config.get("DEPLOYGUARD_ENABLE_HTTPS", "false") === "true",
        defaultAppPort: Number(config.get("DEPLOYGUARD_DEFAULT_APP_PORT", "3000")),
    };
}
function splitCsv(value) {
    return value.split(",").map((item) => item.trim()).filter(Boolean);
}
//# sourceMappingURL=infrastructure.config.js.map