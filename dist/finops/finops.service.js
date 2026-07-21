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
exports.FinopsService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const audit_log_service_1 = require("../audit-log/audit-log.service");
const project_detection_profile_entity_1 = require("../projects/project-detection-profile.entity");
const project_pipeline_event_entity_1 = require("../projects/project-pipeline-event.entity");
const project_pipeline_run_entity_1 = require("../projects/project-pipeline-run.entity");
const project_preflight_report_entity_1 = require("../projects/project-preflight-report.entity");
const project_entity_1 = require("../projects/project.entity");
const user_entity_1 = require("../users/user.entity");
const project_persistent_storage_entity_1 = require("../storage/project-persistent-storage.entity");
const finops_config_1 = require("./finops.config");
const finops_policy_service_1 = require("./finops-policy.service");
const infracost_service_1 = require("./infracost.service");
const project_cost_estimate_entity_1 = require("./project-cost-estimate.entity");
const project_cost_resource_breakdown_entity_1 = require("./project-cost-resource-breakdown.entity");
const project_cost_settings_entity_1 = require("./project-cost-settings.entity");
const terraform_cost_plan_service_1 = require("./terraform-cost-plan.service");
const SAFE_COST_METADATA_KEYS = [
    "projectId",
    "pipelineRunId",
    "estimateId",
    "source",
    "status",
    "currency",
    "totalMonthlyCost",
    "monthlyCostDifference",
    "subscriptionTier",
    "tierLimitMonthlyCost",
    "warningThresholdMonthlyCost",
    "approvalRequired",
    "blockedByTierLimit",
    "resourceCount",
    "reason",
];
let FinopsService = class FinopsService {
    constructor(projectRepository, profileRepository, preflightRepository, runRepository, eventRepository, estimateRepository, breakdownRepository, settingsRepository, storageRepository, config, auditLogService, policyService, infracostService, terraformCostPlanService) {
        this.projectRepository = projectRepository;
        this.profileRepository = profileRepository;
        this.preflightRepository = preflightRepository;
        this.runRepository = runRepository;
        this.eventRepository = eventRepository;
        this.estimateRepository = estimateRepository;
        this.breakdownRepository = breakdownRepository;
        this.settingsRepository = settingsRepository;
        this.storageRepository = storageRepository;
        this.config = config;
        this.auditLogService = auditLogService;
        this.policyService = policyService;
        this.infracostService = infracostService;
        this.terraformCostPlanService = terraformCostPlanService;
    }
    async createEstimate(user, projectId, req) {
        const project = await this.findProjectForManage(user, projectId);
        const estimate = await this.generateEstimate({ project, actorUser: user, req });
        return this.toEstimateResponse(estimate);
    }
    async generatePipelineEstimate(input) {
        return this.generateEstimate(input);
    }
    async listEstimates(user, projectId) {
        const project = await this.findProjectForView(user, projectId);
        const estimates = await this.estimateRepository.find({
            where: { projectId: project.id },
            order: { createdAt: "DESC" },
            take: 50,
        });
        return estimates.map((estimate) => this.toEstimateResponse(estimate));
    }
    async getLatestEstimate(user, projectId) {
        const project = await this.findProjectForView(user, projectId);
        const estimate = await this.estimateRepository.findOne({
            where: { projectId: project.id },
            order: { createdAt: "DESC" },
            relations: { breakdowns: true },
        });
        return estimate ? this.toEstimateResponse(estimate) : null;
    }
    async getEstimate(user, projectId, estimateId) {
        const project = await this.findProjectForView(user, projectId);
        const estimate = await this.findEstimate(project.id, estimateId);
        return this.toEstimateResponse(estimate);
    }
    async getSettings(user, projectId) {
        const project = await this.findProjectForView(user, projectId);
        const settings = await this.getOrCreateSettings(project.id);
        return this.toSettingsResponse(settings);
    }
    async updateSettings(user, projectId, dto, req) {
        const project = await this.findProjectForManage(user, projectId);
        const settings = await this.getOrCreateSettings(project.id);
        const config = (0, finops_config_1.getFinopsConfig)(this.config);
        if (dto.subscriptionTier !== undefined) {
            if (user.role !== user_entity_1.UserRole.ADMIN) {
                throw new common_1.ForbiddenException("Only admins can update subscription tier.");
            }
            if (!Object.values(project_cost_settings_entity_1.SubscriptionTier).includes(dto.subscriptionTier)) {
                throw new common_1.BadRequestException("Invalid subscription tier.");
            }
            settings.subscriptionTier = dto.subscriptionTier;
        }
        if (dto.warningThresholdMonthlyCost !== undefined) {
            const threshold = Number(dto.warningThresholdMonthlyCost);
            if (!Number.isFinite(threshold) || threshold < 0) {
                throw new common_1.BadRequestException("Warning threshold must be a positive number.");
            }
            settings.warningThresholdMonthlyCost = threshold;
        }
        settings.currency = String(dto.currency || settings.currency || config.currency);
        settings.updatedByUserId = user.id;
        const saved = await this.settingsRepository.save(settings);
        await this.audit("COST_SETTINGS_UPDATED", project, user, "success", {
            projectId: project.id,
            subscriptionTier: saved.subscriptionTier,
            warningThresholdMonthlyCost: saved.warningThresholdMonthlyCost,
            currency: saved.currency,
            status: "success",
        }, req);
        return this.toSettingsResponse(saved);
    }
    async approveEstimate(user, projectId, estimateId, req) {
        const project = await this.findProjectForManage(user, projectId);
        const estimate = await this.findEstimate(project.id, estimateId);
        if (!this.policyService.canApprove(estimate)) {
            throw new common_1.BadRequestException("Only cost estimates requiring approval can be approved.");
        }
        estimate.status = project_cost_estimate_entity_1.CostEstimateStatus.APPROVED;
        estimate.approvedByUserId = user.id;
        estimate.approvedAt = new Date();
        estimate.approvalRequired = false;
        const saved = await this.estimateRepository.save(estimate);
        await this.pipelineEvent(saved, "cost_approved", "success", "Cost estimate approved.");
        await this.audit("COST_APPROVED", project, user, "success", {
            projectId: project.id,
            pipelineRunId: saved.pipelineRunId,
            estimateId: saved.id,
            status: saved.status,
            totalMonthlyCost: saved.totalMonthlyCost,
            subscriptionTier: saved.subscriptionTier,
        }, req);
        if (saved.pipelineRunId) {
            await this.updatePipelineStatus(saved.pipelineRunId, {
                status: project_pipeline_run_entity_1.PipelineRunStatus.WAITING_FOR_COST_APPROVAL,
                currentStage: "cost_approved",
            });
        }
        return this.toEstimateResponse(saved);
    }
    async resumePipelineAfterCostApproval(projectId, pipelineRunId, estimateId) {
        return {
            projectId,
            pipelineRunId,
            estimateId,
            status: "resume_not_configured",
            message: "Pipeline resume after FinOps approval will continue into 6.8 provisioning.",
        };
    }
    async rejectEstimate(user, projectId, estimateId, dto, req) {
        const project = await this.findProjectForManage(user, projectId);
        const estimate = await this.findEstimate(project.id, estimateId);
        if (!this.policyService.canReject(estimate)) {
            throw new common_1.BadRequestException("Only cost estimates requiring approval can be rejected.");
        }
        estimate.status = project_cost_estimate_entity_1.CostEstimateStatus.REJECTED;
        estimate.rejectedByUserId = user.id;
        estimate.rejectedAt = new Date();
        estimate.rejectionReason = String(dto.reason || "Rejected by reviewer.");
        estimate.approvalRequired = false;
        const saved = await this.estimateRepository.save(estimate);
        await this.pipelineEvent(saved, "cost_rejected", "failed", "Cost estimate rejected.");
        await this.audit("COST_REJECTED", project, user, "success", {
            projectId: project.id,
            pipelineRunId: saved.pipelineRunId,
            estimateId: saved.id,
            status: saved.status,
            totalMonthlyCost: saved.totalMonthlyCost,
            subscriptionTier: saved.subscriptionTier,
        }, req);
        if (saved.pipelineRunId) {
            await this.updatePipelineStatus(saved.pipelineRunId, {
                status: project_pipeline_run_entity_1.PipelineRunStatus.COST_REJECTED,
                currentStage: "cost_rejected",
                failedAt: new Date(),
                errorMessage: "Cost estimate rejected.",
            });
        }
        return this.toEstimateResponse(saved);
    }
    async generateEstimate(input) {
        const { project, actorUser, pipelineRun, req } = input;
        const config = (0, finops_config_1.getFinopsConfig)(this.config);
        const settings = await this.getOrCreateSettings(project.id);
        const previousEstimate = await this.estimateRepository.findOne({
            where: { projectId: project.id },
            order: { createdAt: "DESC" },
        });
        let estimate = await this.estimateRepository.save(this.estimateRepository.create({
            projectId: project.id,
            pipelineRunId: pipelineRun?.id || null,
            createdByUserId: actorUser?.id || null,
            status: project_cost_estimate_entity_1.CostEstimateStatus.CALCULATING,
            source: config.mockMode ? project_cost_estimate_entity_1.CostEstimateSource.MOCK : project_cost_estimate_entity_1.CostEstimateSource.INFRACOST,
            currency: settings.currency || config.currency,
            previousMonthlyCost: previousEstimate?.totalMonthlyCost || 0,
            subscriptionTier: settings.subscriptionTier,
            warningThresholdMonthlyCost: settings.warningThresholdMonthlyCost,
            metadata: { mode: config.mockMode ? "mock" : "real" },
        }));
        await this.pipelineEvent(estimate, "cost_analysis_started", "running", "Cost analysis started.");
        await this.audit("COST_ANALYSIS_STARTED", project, actorUser || null, "success", {
            projectId: project.id,
            pipelineRunId: pipelineRun?.id,
            estimateId: estimate.id,
            source: estimate.source,
            status: estimate.status,
        }, req);
        try {
            const result = config.mockMode
                ? await this.generateMockBreakdown(project, estimate, actorUser || null, req)
                : await this.generateRealBreakdown(project, estimate, actorUser || null, req);
            const totalMonthlyCost = this.roundMoney(result.resources.reduce((sum, resource) => sum + resource.monthlyCost, 0));
            const policy = this.policyService.evaluate({
                totalMonthlyCost,
                warningThresholdMonthlyCost: settings.warningThresholdMonthlyCost,
                subscriptionTier: settings.subscriptionTier,
            });
            estimate.totalMonthlyCost = totalMonthlyCost;
            estimate.monthlyCostDifference = this.roundMoney(totalMonthlyCost - (estimate.previousMonthlyCost || 0));
            estimate.tierLimitMonthlyCost = policy.tierLimitMonthlyCost;
            estimate.status = policy.status;
            estimate.approvalRequired = policy.approvalRequired;
            estimate.blockedByTierLimit = policy.blockedByTierLimit;
            estimate.upgradePromptMessage = policy.upgradePromptMessage;
            estimate.terraformPlanSummary = result.terraformPlanSummary;
            estimate.rawInfracostResponse = result.rawInfracostResponse;
            estimate.normalizedBreakdown = {
                resources: result.resources.map((resource) => ({
                    resourceType: resource.resourceType,
                    resourceName: resource.resourceName,
                    monthlyCost: resource.monthlyCost,
                })),
            };
            estimate.metadata = {
                mode: config.mockMode ? "mock" : "real",
                resourceCount: result.resources.length,
            };
            estimate = await this.estimateRepository.save(estimate);
            await this.saveBreakdowns(estimate, result.resources);
            estimate.breakdowns = await this.breakdownRepository.find({
                where: { estimateId: estimate.id },
                order: { monthlyCost: "DESC" },
            });
            await this.pipelineEvent(estimate, "cost_breakdown_processed", "success", "Cost breakdown processed.", {
                estimateId: estimate.id,
                resourceCount: result.resources.length,
                totalMonthlyCost,
            });
            await this.audit("COST_BREAKDOWN_PROCESSED", project, actorUser || null, "success", {
                projectId: project.id,
                pipelineRunId: pipelineRun?.id,
                estimateId: estimate.id,
                resourceCount: result.resources.length,
                totalMonthlyCost,
            }, req);
            await this.pipelineEvent(estimate, "cost_policy_evaluated", "success", "Cost policy evaluated.", {
                estimateId: estimate.id,
                status: estimate.status,
                approvalRequired: estimate.approvalRequired,
                blockedByTierLimit: estimate.blockedByTierLimit,
                totalMonthlyCost,
                subscriptionTier: estimate.subscriptionTier,
                tierLimitMonthlyCost: estimate.tierLimitMonthlyCost,
                warningThresholdMonthlyCost: estimate.warningThresholdMonthlyCost,
            });
            await this.audit("COST_POLICY_EVALUATED", project, actorUser || null, "success", {
                projectId: project.id,
                pipelineRunId: pipelineRun?.id,
                estimateId: estimate.id,
                status: estimate.status,
                totalMonthlyCost,
                subscriptionTier: estimate.subscriptionTier,
                approvalRequired: estimate.approvalRequired,
                blockedByTierLimit: estimate.blockedByTierLimit,
            }, req);
            if (estimate.blockedByTierLimit) {
                await this.pipelineEvent(estimate, "deployment_blocked_by_cost_limit", "failed", estimate.upgradePromptMessage || "Estimated monthly cost exceeds tier limit.", { estimateId: estimate.id, totalMonthlyCost, tierLimitMonthlyCost: estimate.tierLimitMonthlyCost });
                await this.audit("DEPLOYMENT_BLOCKED_BY_COST_LIMIT", project, actorUser || null, "failed", {
                    projectId: project.id,
                    pipelineRunId: pipelineRun?.id,
                    estimateId: estimate.id,
                    status: estimate.status,
                    totalMonthlyCost,
                    tierLimitMonthlyCost: estimate.tierLimitMonthlyCost,
                }, req);
            }
            else if (estimate.approvalRequired) {
                await this.pipelineEvent(estimate, "cost_approval_required", "waiting", "Cost estimate requires approval.", {
                    estimateId: estimate.id,
                    totalMonthlyCost,
                    warningThresholdMonthlyCost: estimate.warningThresholdMonthlyCost,
                });
                await this.pipelineEvent(estimate, "cost_threshold_warning", "warning", "Estimated monthly cost exceeds the warning threshold.", {
                    estimateId: estimate.id,
                    totalMonthlyCost,
                    warningThresholdMonthlyCost: estimate.warningThresholdMonthlyCost,
                });
                await this.audit("COST_APPROVAL_REQUIRED", project, actorUser || null, "success", {
                    projectId: project.id,
                    pipelineRunId: pipelineRun?.id,
                    estimateId: estimate.id,
                    status: estimate.status,
                    totalMonthlyCost,
                    warningThresholdMonthlyCost: estimate.warningThresholdMonthlyCost,
                }, req);
            }
            else {
                await this.pipelineEvent(estimate, "cost_analysis_passed", "success", "Cost policy passed.", {
                    estimateId: estimate.id,
                    totalMonthlyCost,
                });
            }
            return estimate;
        }
        catch (error) {
            const message = error instanceof Error ? error.message : "Cost analysis failed.";
            estimate.status = project_cost_estimate_entity_1.CostEstimateStatus.FAILED;
            estimate.errorMessage = this.publicErrorMessage(message);
            estimate = await this.estimateRepository.save(estimate);
            await this.pipelineEvent(estimate, "cost_analysis_failed", "failed", estimate.errorMessage, {
                estimateId: estimate.id,
                reason: estimate.errorMessage,
            });
            await this.audit("COST_ANALYSIS_FAILED", project, actorUser || null, "failed", {
                projectId: project.id,
                pipelineRunId: pipelineRun?.id,
                estimateId: estimate.id,
                status: estimate.status,
                reason: estimate.errorMessage,
            }, req);
            throw error;
        }
    }
    async generateMockBreakdown(project, estimate, actorUser, req) {
        const config = (0, finops_config_1.getFinopsConfig)(this.config);
        const profile = await this.profileRepository.findOne({
            where: { projectId: project.id },
        });
        if (!profile) {
            throw new common_1.BadRequestException("Run stack detection before generating a cost estimate.");
        }
        const preflight = await this.preflightRepository.findOne({
            where: { projectId: project.id },
        });
        if (!preflight) {
            throw new common_1.BadRequestException("Generate a pre-flight report before generating a cost estimate.");
        }
        const framework = (profile?.framework || profile?.ecosystem || "app").toLowerCase();
        const computeCost = framework.includes("next") || framework.includes("django") ? 35 : 18;
        const storage = await this.storageRepository.findOne({
            where: { projectId: project.id, environmentName: "dev" },
            order: { createdAt: "DESC" },
        });
        const efsRequired = Boolean(profile?.requiresPersistentStorage || storage?.enabled || storage?.userEnabled);
        const resources = [
            {
                resourceType: project_cost_resource_breakdown_entity_1.CostResourceType.ECS_FARGATE_COMPUTE,
                resourceName: `${project.name}-service`,
                serviceName: "Amazon ECS on Fargate",
                monthlyCost: computeCost,
                metadata: {
                    source: "mock",
                    assumption: "small always-on service",
                    cpu: "0.25 vCPU",
                    memory: "0.5 GB",
                    runningHours: 730,
                },
            },
            {
                resourceType: project_cost_resource_breakdown_entity_1.CostResourceType.LOAD_BALANCER,
                resourceName: `${project.name}-alb`,
                serviceName: "Application Load Balancer",
                monthlyCost: 18,
                metadata: { source: "mock", assumption: "dedicated ALB estimate" },
            },
            {
                resourceType: project_cost_resource_breakdown_entity_1.CostResourceType.STORAGE,
                resourceName: `${project.name}-ecr-logs`,
                serviceName: "ECR and log storage",
                monthlyCost: efsRequired ? 8 : 3,
                metadata: { source: "mock", assumption: "ECR image storage and small logs" },
            },
            {
                resourceType: project_cost_resource_breakdown_entity_1.CostResourceType.DATA_TRANSFER,
                resourceName: `${project.name}-data-transfer`,
                serviceName: "Data transfer",
                monthlyCost: 5,
                metadata: { source: "mock", assumedGbPerMonth: 50 },
            },
            {
                resourceType: project_cost_resource_breakdown_entity_1.CostResourceType.CLOUDWATCH_LOGS,
                resourceName: `${project.name}-logs`,
                serviceName: "CloudWatch Logs",
                monthlyCost: 4,
                metadata: { source: "mock", assumedGbPerMonth: 5 },
            },
        ];
        if (profile?.requiresDatabase) {
            resources.push({
                resourceType: project_cost_resource_breakdown_entity_1.CostResourceType.DATABASE,
                resourceName: `${project.name}-${profile.databaseType || "database"}`,
                serviceName: "Managed database",
                monthlyCost: 25,
                metadata: { source: "mock", databaseType: profile.databaseType || "unknown" },
            });
        }
        if (efsRequired) {
            resources.push({
                resourceType: project_cost_resource_breakdown_entity_1.CostResourceType.STORAGE,
                resourceName: `${project.name}-efs`,
                serviceName: "Amazon EFS",
                monthlyCost: 12,
                metadata: {
                    source: "mock",
                    assumption: "small persistent file share",
                    storageEnabled: Boolean(storage?.enabled || storage?.userEnabled),
                    requiredByDetection: Boolean(profile?.requiresPersistentStorage),
                },
            }, {
                resourceType: project_cost_resource_breakdown_entity_1.CostResourceType.STORAGE,
                resourceName: `${project.name}-efs-backup`,
                serviceName: "AWS Backup",
                monthlyCost: storage?.backupEnabled === false ? 0 : 4,
                metadata: {
                    source: "mock",
                    assumption: "daily retained EFS backup baseline",
                    backupEnabled: storage?.backupEnabled !== false,
                },
            }, {
                resourceType: project_cost_resource_breakdown_entity_1.CostResourceType.STORAGE,
                resourceName: `${project.name}-efs-kms`,
                serviceName: "AWS KMS",
                monthlyCost: 1,
                metadata: { source: "mock", assumption: "customer managed EFS KMS key" },
            });
        }
        await this.pipelineEvent(estimate, "mock_cost_estimate_generated", "success", "Mock cost estimate generated.", {
            estimateId: estimate.id,
            resourceCount: resources.length,
            source: project_cost_estimate_entity_1.CostEstimateSource.MOCK,
        });
        await this.audit("MOCK_COST_ESTIMATE_GENERATED", project, actorUser, "success", {
            projectId: project.id,
            pipelineRunId: estimate.pipelineRunId,
            estimateId: estimate.id,
            resourceCount: resources.length,
            source: project_cost_estimate_entity_1.CostEstimateSource.MOCK,
            status: "success",
        }, req);
        return {
            resources,
            terraformPlanSummary: {
                source: "mock",
                mock: true,
                reason: "FINOPS_MOCK_MODE is enabled because real Terraform/Infracost integration is not configured yet.",
                currency: config.currency,
                profileId: profile?.id || null,
                framework: profile?.framework || null,
                requiresDatabase: Boolean(profile?.requiresDatabase),
                requiresPersistentStorage: efsRequired,
            },
            rawInfracostResponse: null,
        };
    }
    async generateRealBreakdown(project, estimate, actorUser, req) {
        const config = (0, finops_config_1.getFinopsConfig)(this.config);
        if (!config.enableRealTerraform) {
            throw new Error("Terraform modules are not configured for cost estimation.");
        }
        await this.pipelineEvent(estimate, "terraform_plan_started", "running", "Terraform cost plan started.");
        const plan = await this.terraformCostPlanService.generateTerraformPlan(project);
        const planJson = await this.terraformCostPlanService.convertTerraformPlanToJson(plan.planPath, plan.workdir);
        await this.pipelineEvent(estimate, "terraform_plan_generated", "success", "Terraform plan JSON generated.");
        await this.audit("TERRAFORM_COST_PLAN_GENERATED", project, actorUser, "success", {
            projectId: project.id,
            pipelineRunId: estimate.pipelineRunId,
            estimateId: estimate.id,
            status: "success",
        }, req);
        await this.pipelineEvent(estimate, "infracost_estimate_started", "running", "Infracost estimate started.");
        await this.audit("INFRACOST_ESTIMATE_STARTED", project, actorUser, "success", {
            projectId: project.id,
            pipelineRunId: estimate.pipelineRunId,
            estimateId: estimate.id,
            source: project_cost_estimate_entity_1.CostEstimateSource.INFRACOST,
            status: "running",
        }, req);
        const rawOutput = await this.infracostService.runInfracostBreakdown(planJson, plan.workdir);
        const parsed = this.infracostService.parseInfracostResponse(rawOutput);
        const resources = this.infracostService.normalizeCostBreakdown(parsed);
        await this.pipelineEvent(estimate, "infracost_estimate_generated", "success", "Infracost estimate generated.", {
            estimateId: estimate.id,
            resourceCount: resources.length,
        });
        await this.audit("INFRACOST_ESTIMATE_GENERATED", project, actorUser, "success", {
            projectId: project.id,
            pipelineRunId: estimate.pipelineRunId,
            estimateId: estimate.id,
            resourceCount: resources.length,
            source: project_cost_estimate_entity_1.CostEstimateSource.INFRACOST,
            status: "success",
        }, req);
        return {
            resources,
            terraformPlanSummary: { source: "terraform", planPath: "tfplan" },
            rawInfracostResponse: parsed,
        };
    }
    async saveBreakdowns(estimate, resources) {
        await this.breakdownRepository.delete({ estimateId: estimate.id });
        const breakdowns = resources.map((resource) => this.breakdownRepository.create({
            estimateId: estimate.id,
            projectId: estimate.projectId,
            pipelineRunId: estimate.pipelineRunId,
            resourceType: resource.resourceType,
            resourceName: resource.resourceName,
            provider: "aws",
            serviceName: resource.serviceName || null,
            monthlyCost: this.roundMoney(resource.monthlyCost),
            hourlyCost: resource.hourlyCost || null,
            unit: resource.unit || null,
            quantity: resource.quantity || null,
            metadata: resource.metadata || null,
        }));
        if (breakdowns.length > 0) {
            await this.breakdownRepository.save(breakdowns);
        }
    }
    async getOrCreateSettings(projectId) {
        const existing = await this.settingsRepository.findOne({ where: { projectId } });
        if (existing) {
            return existing;
        }
        const config = (0, finops_config_1.getFinopsConfig)(this.config);
        return this.settingsRepository.save(this.settingsRepository.create({
            projectId,
            subscriptionTier: project_cost_settings_entity_1.SubscriptionTier.FREE,
            warningThresholdMonthlyCost: config.defaultWarningThreshold,
            currency: config.currency,
        }));
    }
    async findProjectForView(user, projectId) {
        const project = await this.projectRepository.findOne({ where: { id: projectId } });
        if (!project || project.status === project_entity_1.ProjectStatus.ARCHIVED) {
            throw new common_1.NotFoundException("Project not found");
        }
        if (user.role === user_entity_1.UserRole.ADMIN ||
            project.ownerUserId === user.id ||
            (user.role === user_entity_1.UserRole.READONLY && project.visibility === project_entity_1.ProjectVisibility.WORKSPACE)) {
            return project;
        }
        throw new common_1.ForbiddenException("Insufficient permissions");
    }
    async findProjectForManage(user, projectId) {
        const project = await this.findProjectForView(user, projectId);
        if (user.role === user_entity_1.UserRole.READONLY) {
            throw new common_1.ForbiddenException("Insufficient permissions");
        }
        if (user.role === user_entity_1.UserRole.ADMIN || project.ownerUserId === user.id) {
            return project;
        }
        throw new common_1.ForbiddenException("Insufficient permissions");
    }
    async findEstimate(projectId, estimateId) {
        const estimate = await this.estimateRepository.findOne({
            where: { id: estimateId, projectId },
            relations: { breakdowns: true },
        });
        if (!estimate) {
            throw new common_1.NotFoundException("Cost estimate not found");
        }
        return estimate;
    }
    async pipelineEvent(estimate, stage, status, message, metadata = {}) {
        if (!estimate.pipelineRunId) {
            return;
        }
        await this.eventRepository.save(this.eventRepository.create({
            pipelineRunId: estimate.pipelineRunId,
            projectId: estimate.projectId,
            stage,
            status,
            message,
            metadata: this.safeMetadata({
                projectId: estimate.projectId,
                pipelineRunId: estimate.pipelineRunId,
                estimateId: estimate.id,
                stage,
                status,
                ...metadata,
            }),
        }));
    }
    async audit(action, project, actorUser, status, metadata, req) {
        await this.auditLogService.record({
            actorUser,
            action,
            resourceType: "cost_estimate",
            resourceId: metadata.estimateId ? String(metadata.estimateId) : project.id,
            status,
            metadata: this.safeMetadata(metadata),
            req,
        });
    }
    safeMetadata(metadata) {
        return Object.entries(metadata).reduce((safe, [key, value]) => {
            if (SAFE_COST_METADATA_KEYS.includes(key) && value !== undefined) {
                safe[key] = value;
            }
            return safe;
        }, {});
    }
    async updatePipelineStatus(pipelineRunId, patch) {
        const run = await this.runRepository.findOne({ where: { id: pipelineRunId } });
        if (!run) {
            return;
        }
        Object.assign(run, patch);
        await this.runRepository.save(run);
    }
    roundMoney(value) {
        return Math.round((Number(value) || 0) * 100) / 100;
    }
    publicErrorMessage(message) {
        if (/token|secret|password|credential|authorization|api.?key/i.test(message)) {
            return "Cost analysis failed because required cost analysis configuration is invalid or missing.";
        }
        return message;
    }
    toSettingsResponse(settings) {
        return {
            id: settings.id,
            projectId: settings.projectId,
            subscriptionTier: settings.subscriptionTier,
            warningThresholdMonthlyCost: settings.warningThresholdMonthlyCost,
            currency: settings.currency,
            updatedByUserId: settings.updatedByUserId,
            createdAt: settings.createdAt,
            updatedAt: settings.updatedAt,
        };
    }
    toEstimateResponse(estimate) {
        return {
            id: estimate.id,
            projectId: estimate.projectId,
            pipelineRunId: estimate.pipelineRunId,
            createdByUserId: estimate.createdByUserId,
            status: estimate.status,
            source: estimate.source,
            currency: estimate.currency,
            totalMonthlyCost: estimate.totalMonthlyCost,
            previousMonthlyCost: estimate.previousMonthlyCost,
            monthlyCostDifference: estimate.monthlyCostDifference,
            tierLimitMonthlyCost: estimate.tierLimitMonthlyCost,
            warningThresholdMonthlyCost: estimate.warningThresholdMonthlyCost,
            subscriptionTier: estimate.subscriptionTier,
            approvalRequired: estimate.approvalRequired,
            blockedByTierLimit: estimate.blockedByTierLimit,
            upgradePromptMessage: estimate.upgradePromptMessage,
            errorMessage: estimate.errorMessage,
            approvedByUserId: estimate.approvedByUserId,
            approvedAt: estimate.approvedAt,
            rejectedByUserId: estimate.rejectedByUserId,
            rejectedAt: estimate.rejectedAt,
            rejectionReason: estimate.rejectionReason,
            breakdowns: (estimate.breakdowns || []).map((breakdown) => ({
                id: breakdown.id,
                resourceType: breakdown.resourceType,
                resourceName: breakdown.resourceName,
                provider: breakdown.provider,
                serviceName: breakdown.serviceName,
                monthlyCost: breakdown.monthlyCost,
                hourlyCost: breakdown.hourlyCost,
                unit: breakdown.unit,
                quantity: breakdown.quantity,
            })),
            createdAt: estimate.createdAt,
            updatedAt: estimate.updatedAt,
        };
    }
};
exports.FinopsService = FinopsService;
exports.FinopsService = FinopsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(project_entity_1.Project)),
    __param(1, (0, typeorm_1.InjectRepository)(project_detection_profile_entity_1.ProjectDetectionProfile)),
    __param(2, (0, typeorm_1.InjectRepository)(project_preflight_report_entity_1.ProjectPreflightReport)),
    __param(3, (0, typeorm_1.InjectRepository)(project_pipeline_run_entity_1.ProjectPipelineRun)),
    __param(4, (0, typeorm_1.InjectRepository)(project_pipeline_event_entity_1.ProjectPipelineEvent)),
    __param(5, (0, typeorm_1.InjectRepository)(project_cost_estimate_entity_1.ProjectCostEstimate)),
    __param(6, (0, typeorm_1.InjectRepository)(project_cost_resource_breakdown_entity_1.ProjectCostResourceBreakdown)),
    __param(7, (0, typeorm_1.InjectRepository)(project_cost_settings_entity_1.ProjectCostSettings)),
    __param(8, (0, typeorm_1.InjectRepository)(project_persistent_storage_entity_1.ProjectPersistentStorage)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        config_1.ConfigService,
        audit_log_service_1.AuditLogService,
        finops_policy_service_1.FinopsPolicyService,
        infracost_service_1.InfracostService,
        terraform_cost_plan_service_1.TerraformCostPlanService])
], FinopsService);
//# sourceMappingURL=finops.service.js.map