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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InfrastructureReadinessService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const fs_1 = require("fs");
const typeorm_2 = require("typeorm");
const project_cost_estimate_entity_1 = require("../finops/project-cost-estimate.entity");
const project_detection_profile_entity_1 = require("../projects/project-detection-profile.entity");
const project_preflight_report_entity_1 = require("../projects/project-preflight-report.entity");
const project_pipeline_run_entity_1 = require("../projects/project-pipeline-run.entity");
const project_security_scan_entity_1 = require("../projects/project-security-scan.entity");
const project_entity_1 = require("../projects/project.entity");
const user_entity_1 = require("../users/user.entity");
const infrastructure_config_1 = require("./infrastructure.config");
const project_infrastructure_environment_entity_1 = require("./project-infrastructure-environment.entity");
let InfrastructureReadinessService = class InfrastructureReadinessService {
    constructor(projectRepository, profileRepository, preflightRepository, runRepository, scanRepository, costEstimateRepository, environmentRepository, config) {
        this.projectRepository = projectRepository;
        this.profileRepository = profileRepository;
        this.preflightRepository = preflightRepository;
        this.runRepository = runRepository;
        this.scanRepository = scanRepository;
        this.costEstimateRepository = costEstimateRepository;
        this.environmentRepository = environmentRepository;
        this.config = config;
    }
    async getDeploymentReadiness(projectId, user) {
        const project = await this.projectRepository.findOne({ where: { id: projectId } });
        const checks = [];
        if (!project || project.status === project_entity_1.ProjectStatus.ARCHIVED) {
            return this.result([{ key: "project", label: "Project", status: "missing", blocking: true, message: "Project not found." }]);
        }
        const canManage = user.role === user_entity_1.UserRole.ADMIN ||
            (user.role === user_entity_1.UserRole.DEVELOPER && project.ownerUserId === user.id);
        const canView = canManage ||
            project.ownerUserId === user.id ||
            (user.role === user_entity_1.UserRole.READONLY && project.visibility === project_entity_1.ProjectVisibility.WORKSPACE);
        if (!canView) {
            checks.push({ key: "access", label: "Project access", status: "failed", blocking: true, message: "Insufficient permissions." });
            return this.result(checks);
        }
        checks.push({ key: "project", label: "Project", status: "passed", blocking: false, message: "Project exists." });
        checks.push(this.checkBoolean("repository", "GitHub repository", Boolean(project.repositoryUrl), "Repository is linked.", "Link a GitHub repository first."));
        checks.push(this.checkBoolean("target_branch", "Target branch", Boolean(project.targetBranch), "Target branch is selected.", "Select a target branch first."));
        const profile = await this.profileRepository.findOne({ where: { projectId: project.id } });
        checks.push(this.checkBoolean("stack_detection", "Stack detection", Boolean(profile), "Stack detection profile exists.", "Run stack detection first."));
        const preflight = await this.preflightRepository.findOne({ where: { projectId: project.id } });
        const preflightPassed = Boolean(preflight &&
            [project_preflight_report_entity_1.PreflightValidationStatus.PASSED, project_preflight_report_entity_1.PreflightValidationStatus.PASSED_WITH_WARNINGS].includes(preflight.validationStatus));
        checks.push(this.checkBoolean("preflight", "Pre-flight validation", preflightPassed, "Pre-flight validation passed.", "Generate and pass pre-flight validation first."));
        checks.push(this.checkBoolean("github_actions", "GitHub Actions workflow", Boolean(this.config.get("GITHUB_TOKEN") && this.config.get("GITHUB_ACTIONS_WORKFLOW_FILE", "deploy.yml")), "GitHub Actions dispatch is configured.", "GitHub Actions workflow dispatch is not configured."));
        const latestRun = await this.runRepository.findOne({
            where: { projectId: project.id },
            order: { createdAt: "DESC" },
        });
        checks.push(this.checkBoolean("artifact", "Docker artifact", Boolean(!latestRun || latestRun.ecrImageUri || canManage), "Docker build artifact is ready or can be built by deployment.", "Docker build artifact is not ready."));
        const latestScan = await this.scanRepository.findOne({
            where: { projectId: project.id },
            order: { createdAt: "DESC" },
        });
        const securityPassed = Boolean(!latestScan ||
            latestScan.policyDecision === project_security_scan_entity_1.SecurityPolicyDecision.ALLOWED ||
            latestScan.policyDecision === project_security_scan_entity_1.SecurityPolicyDecision.APPROVED_OVERRIDE);
        checks.push(this.checkBoolean("security", "Security gate", securityPassed, "Security gate is passable.", "Security scan is blocked by critical/high vulnerabilities."));
        const latestCost = await this.costEstimateRepository.findOne({
            where: { projectId: project.id },
            order: { createdAt: "DESC" },
        });
        checks.push(this.costCheck(latestCost));
        checks.push(this.checkBoolean("aws_config", "AWS configuration", this.hasAwsConfig(), "AWS configuration is present.", "AWS credentials are not configured."));
        const infraConfig = (0, infrastructure_config_1.getInfrastructureConfig)(this.config);
        checks.push(this.checkBoolean("terraform_templates", "Terraform templates", (0, fs_1.existsSync)(infraConfig.terraformNetworkTemplateDir), "Terraform templates are configured.", "Terraform templates are not configured."));
        const activeEnvironment = await this.environmentRepository.findOne({
            where: [
                { projectId: project.id, status: project_infrastructure_environment_entity_1.InfrastructureEnvironmentStatus.QUEUED },
                { projectId: project.id, status: project_infrastructure_environment_entity_1.InfrastructureEnvironmentStatus.PLANNING },
                { projectId: project.id, status: project_infrastructure_environment_entity_1.InfrastructureEnvironmentStatus.PROVISIONING },
            ],
            order: { createdAt: "DESC" },
        });
        checks.push(this.checkBoolean("not_in_progress", "Deployment progress", !activeEnvironment, "No deployment is currently running.", "Deployment already in progress."));
        checks.push(this.checkBoolean("write_access", "Deploy permission", canManage, "User can deploy this project.", "Readonly users cannot deploy."));
        return this.result(checks);
    }
    async assertDeploymentReady(projectId, user) {
        const readiness = await this.getDeploymentReadiness(projectId, user);
        if (!readiness.ready) {
            throw new Error(readiness.blockingReasons[0] || "Deployment is not ready.");
        }
        return readiness;
    }
    async getReadinessReasons(projectId, user) {
        const readiness = await this.getDeploymentReadiness(projectId, user);
        return readiness.blockingReasons;
    }
    result(checks) {
        const blockingReasons = checks
            .filter((check) => check.blocking)
            .map((check) => check.message);
        return {
            ready: blockingReasons.length === 0,
            checks,
            blockingReasons,
            nextRequiredAction: blockingReasons[0] || null,
        };
    }
    checkBoolean(key, label, passed, passedMessage, failedMessage) {
        return {
            key,
            label,
            status: passed ? "passed" : "missing",
            blocking: !passed,
            message: passed ? passedMessage : failedMessage,
        };
    }
    costCheck(estimate) {
        if (!estimate) {
            return { key: "cost", label: "FinOps cost gate", status: "missing", blocking: true, message: "Generate a cost estimate first." };
        }
        if ([project_cost_estimate_entity_1.CostEstimateStatus.NO_APPROVAL_REQUIRED, project_cost_estimate_entity_1.CostEstimateStatus.APPROVED].includes(estimate.status)) {
            return { key: "cost", label: "FinOps cost gate", status: "passed", blocking: false, message: "Cost gate passed." };
        }
        const messages = {
            [project_cost_estimate_entity_1.CostEstimateStatus.APPROVAL_REQUIRED]: "Cost approval is required before deployment.",
            [project_cost_estimate_entity_1.CostEstimateStatus.REJECTED]: "Cost estimate was rejected.",
            [project_cost_estimate_entity_1.CostEstimateStatus.BLOCKED_BY_TIER_LIMIT]: "Deployment blocked by subscription tier limit.",
            [project_cost_estimate_entity_1.CostEstimateStatus.FAILED]: "Cost analysis failed.",
        };
        return {
            key: "cost",
            label: "FinOps cost gate",
            status: "failed",
            blocking: true,
            message: messages[estimate.status] || "Cost gate is not ready.",
        };
    }
    hasAwsConfig() {
        return Boolean(this.config.get("AWS_REGION") &&
            this.config.get("AWS_ACCOUNT_ID") &&
            this.config.get("AWS_ACCESS_KEY_ID") &&
            this.config.get("AWS_SECRET_ACCESS_KEY"));
    }
};
exports.InfrastructureReadinessService = InfrastructureReadinessService;
exports.InfrastructureReadinessService = InfrastructureReadinessService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(project_entity_1.Project)),
    __param(1, (0, typeorm_1.InjectRepository)(project_detection_profile_entity_1.ProjectDetectionProfile)),
    __param(2, (0, typeorm_1.InjectRepository)(project_preflight_report_entity_1.ProjectPreflightReport)),
    __param(3, (0, typeorm_1.InjectRepository)(project_pipeline_run_entity_1.ProjectPipelineRun)),
    __param(4, (0, typeorm_1.InjectRepository)(project_security_scan_entity_1.ProjectSecurityScan)),
    __param(5, (0, typeorm_1.InjectRepository)(project_cost_estimate_entity_1.ProjectCostEstimate)),
    __param(6, (0, typeorm_1.InjectRepository)(project_infrastructure_environment_entity_1.ProjectInfrastructureEnvironment)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        config_1.ConfigService])
], InfrastructureReadinessService);
//# sourceMappingURL=infrastructure-readiness.service.js.map