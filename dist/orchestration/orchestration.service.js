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
exports.OrchestrationService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const audit_log_service_1 = require("../audit-log/audit-log.service");
const infrastructure_service_1 = require("../infrastructure/infrastructure.service");
const project_infrastructure_environment_entity_1 = require("../infrastructure/project-infrastructure-environment.entity");
const project_pipeline_run_entity_1 = require("../projects/project-pipeline-run.entity");
const project_entity_1 = require("../projects/project.entity");
const user_entity_1 = require("../users/user.entity");
const alb_service_1 = require("./alb.service");
const autoscaling_service_1 = require("./autoscaling.service");
const ecs_service_1 = require("./ecs.service");
const project_deployment_entity_1 = require("./project-deployment.entity");
const project_orchestration_event_entity_1 = require("./project-orchestration-event.entity");
const project_stable_release_entity_1 = require("./project-stable-release.entity");
const rollback_service_1 = require("./rollback.service");
const spot_interruption_service_1 = require("./spot-interruption.service");
const orchestration_config_1 = require("./orchestration.config");
let OrchestrationService = class OrchestrationService {
    constructor(projectRepository, runRepository, environmentRepository, deploymentRepository, releaseRepository, eventRepository, infrastructureService, config, auditLogService, ecsService, albService, autoscalingService, rollbackService, spotInterruptionService) {
        this.projectRepository = projectRepository;
        this.runRepository = runRepository;
        this.environmentRepository = environmentRepository;
        this.deploymentRepository = deploymentRepository;
        this.releaseRepository = releaseRepository;
        this.eventRepository = eventRepository;
        this.infrastructureService = infrastructureService;
        this.config = config;
        this.auditLogService = auditLogService;
        this.ecsService = ecsService;
        this.albService = albService;
        this.autoscalingService = autoscalingService;
        this.rollbackService = rollbackService;
        this.spotInterruptionService = spotInterruptionService;
    }
    async deploy(user, projectId, req) {
        return this.infrastructureService.deploy(user, projectId, req);
    }
    async getStatus(user, projectId) {
        const project = await this.findProjectForView(user, projectId);
        const deployment = await this.deploymentRepository.findOne({
            where: { projectId: project.id },
            order: { createdAt: "DESC" },
        });
        const stableRelease = await this.releaseRepository.findOne({
            where: { projectId: project.id, status: "stable" },
            order: { deployedAt: "DESC" },
        });
        const spotEvents = await this.spotInterruptionService.list(project.id);
        return {
            canManage: user.role !== user_entity_1.UserRole.READONLY && (user.role === user_entity_1.UserRole.ADMIN || project.ownerUserId === user.id),
            deployment,
            stableRelease,
            spotEvents,
            service: await this.ecsService.getServiceStatus(project.id),
            targetHealth: await this.albService.getTargetHealth(project.id),
            scaling: await this.autoscalingService.getScalingStatus(project.id),
        };
    }
    async getEvents(user, projectId) {
        const project = await this.findProjectForView(user, projectId);
        return this.eventRepository.find({
            where: { projectId: project.id },
            order: { createdAt: "ASC" },
        });
    }
    async getReleases(user, projectId) {
        const project = await this.findProjectForView(user, projectId);
        return this.releaseRepository.find({
            where: { projectId: project.id },
            order: { deployedAt: "DESC" },
            take: 50,
        });
    }
    async rollback(user, projectId, dto, req) {
        const project = await this.findProjectForManage(user, projectId);
        await this.audit("MANUAL_ROLLBACK_REQUESTED", project.id, user, "success", { reason: dto.reason || "Manual rollback requested." }, req);
        await this.event(project.id, null, null, "rollback_started", "running", "Manual rollback started.", user);
        try {
            const result = await this.rollbackService.rollbackToPreviousStable(project.id, null, dto.reason || "Manual rollback requested.");
            await this.event(project.id, result.deployment.pipelineRunId || null, result.deployment.id, "rollback_succeeded", "success", "Rollback completed.", user, {
                toCommitSha: result.release.commitSha,
            });
            await this.audit("ROLLBACK_SUCCEEDED", project.id, user, "success", { deploymentId: result.deployment.id, toCommitSha: result.release.commitSha }, req);
            return result;
        }
        catch (error) {
            const message = error instanceof Error ? error.message : "Rollback failed.";
            await this.event(project.id, null, null, "rollback_failed", "failed", message, user);
            await this.audit("ROLLBACK_FAILED", project.id, user, "failed", { reason: message }, req);
            throw error;
        }
    }
    async getTargetHealth(user, projectId) {
        const project = await this.findProjectForView(user, projectId);
        return this.albService.getTargetHealth(project.id);
    }
    async getScaling(user, projectId) {
        const project = await this.findProjectForView(user, projectId);
        return this.autoscalingService.getScalingStatus(project.id);
    }
    async updateScaling(user, projectId, dto, req) {
        const project = await this.findProjectForManage(user, projectId);
        const result = await this.autoscalingService.updateScalingPolicy(project.id, Number(dto.minTasks || 1), Number(dto.maxTasks || 3), Number(dto.cpuTargetPercent || 60));
        await this.event(project.id, null, null, "autoscaling_policy_configured", "success", "Auto-scaling policy updated.", user, result);
        await this.audit("SCALING_POLICY_UPDATED", project.id, user, "success", result, req);
        return result;
    }
    async handleSpotEvent(projectId, event, secret) {
        return this.spotInterruptionService.handleSpotInterruptionEvent(projectId, event, secret);
    }
    async recordDeploymentFromInfrastructure(projectId, pipelineRunId, actorUser) {
        const run = await this.runRepository.findOne({ where: { id: pipelineRunId, projectId } });
        if (!run || !run.ecrImageUri || !run.commitSha) {
            throw new common_1.BadRequestException("ECS deployment requires an ECR image URI and full commit SHA.");
        }
        const environment = await this.environmentRepository.findOne({
            where: { projectId },
            order: { createdAt: "DESC" },
        });
        const outputs = environment?.terraformOutputs || {};
        const taskDefinitionArn = this.stringOutput(outputs.ecs_task_definition_arn);
        if (!taskDefinitionArn) {
            throw new common_1.BadRequestException("ECS task definition output is missing. Terraform ECS service was not created.");
        }
        const previous = await this.deploymentRepository.findOne({
            where: { projectId, stable: true },
            order: { deploymentCompletedAt: "DESC" },
        });
        let deployment = await this.deploymentRepository.findOne({
            where: { projectId, pipelineRunId },
            order: { createdAt: "DESC" },
        });
        deployment = deployment || this.deploymentRepository.create({ projectId, pipelineRunId });
        deployment.infrastructureEnvironmentId = environment?.id || null;
        deployment.status = project_deployment_entity_1.ProjectDeploymentStatus.WAITING_FOR_SERVICE_STABILITY;
        deployment.environmentName = "dev";
        deployment.commitSha = run.commitSha;
        deployment.shortCommitSha = run.commitSha.slice(0, 12);
        deployment.imageUri = run.ecrImageUri;
        deployment.taskDefinitionArn = taskDefinitionArn;
        deployment.previousTaskDefinitionArn = previous?.taskDefinitionArn || null;
        deployment.ecsClusterArn = this.stringOutput(outputs.ecs_cluster_arn);
        deployment.ecsClusterName = this.stringOutput(outputs.ecs_cluster_name);
        deployment.ecsServiceArn = this.stringOutput(outputs.ecs_service_arn);
        deployment.ecsServiceName = this.stringOutput(outputs.ecs_service_name);
        deployment.albArn = this.stringOutput(outputs.alb_arn);
        deployment.albDnsName = this.stringOutput(outputs.alb_dns_name);
        deployment.targetGroupArn = this.stringOutput(outputs.alb_target_group_arn);
        deployment.listenerArn = this.stringOutput(outputs.alb_listener_arn);
        deployment.healthCheckPath = this.stringOutput(outputs.alb_health_check_path) || "/health";
        deployment.appPort = Number(outputs.ecs_container_port || 3000);
        deployment.desiredCount = Number(outputs.ecs_desired_count || 1);
        deployment.minTasks = Number(outputs.ecs_min_tasks || 1);
        deployment.maxTasks = Number(outputs.ecs_max_tasks || 3);
        deployment.cpuTargetPercent = Number(outputs.ecs_cpu_target_percent || 60);
        deployment.capacityProviderStrategy = Array.isArray(outputs.ecs_capacity_provider_strategy)
            ? outputs.ecs_capacity_provider_strategy
            : [];
        deployment.efsMountConfig = outputs.efs_enabled ? { enabled: true, fileSystemId: outputs.efs_file_system_id, accessPointId: outputs.efs_access_point_id } : null;
        deployment.cloudMapNamespaceId = this.stringOutput(outputs.cloud_map_namespace_id);
        deployment.cloudMapServiceName = "app";
        deployment.deploymentStartedAt = deployment.deploymentStartedAt || new Date();
        deployment.metadata = this.safeMetadata({
            spotEventRuleName: outputs.spot_event_rule_name,
            spotEventRuleArn: outputs.spot_event_rule_arn,
        });
        deployment = await this.deploymentRepository.save(deployment);
        await this.event(projectId, pipelineRunId, deployment.id, "ecs_service_stability_wait_started", "running", "Waiting for ECS service stability.", actorUser || null);
        await this.audit("ECS_SERVICE_STABILITY_WAIT_STARTED", projectId, actorUser || null, "success", { deploymentId: deployment.id });
        const stabilityResult = await this.ecsService.waitForServiceStability(projectId, deployment.ecsServiceArn);
        deployment.metadata = this.safeMetadata({
            ...deployment.metadata,
            spotEventRuleName: outputs.spot_event_rule_name,
            spotEventRuleArn: outputs.spot_event_rule_arn,
            ecsStability: stabilityResult,
        });
        if (!stabilityResult.stable) {
            deployment.status = project_deployment_entity_1.ProjectDeploymentStatus.UNHEALTHY;
            deployment.stable = false;
            deployment.errorMessage = stabilityResult.reason || "ECS service did not become stable.";
            deployment.failedAt = new Date();
            await this.deploymentRepository.save(deployment);
            await this.event(projectId, pipelineRunId, deployment.id, "ecs_service_unhealthy", "failed", deployment.errorMessage, actorUser || null, stabilityResult);
            await this.audit("ECS_SERVICE_UNSTABLE", projectId, actorUser || null, "failed", { deploymentId: deployment.id, reason: deployment.errorMessage });
            await this.attemptAutoRollback(projectId, pipelineRunId, deployment, deployment.errorMessage, actorUser || null);
            throw new common_1.BadRequestException(deployment.errorMessage);
        }
        await this.event(projectId, pipelineRunId, deployment.id, "alb_health_check_wait_started", "running", "Waiting for ALB target health.", actorUser || null);
        await this.audit("ALB_HEALTH_CHECK_WAIT_STARTED", projectId, actorUser || null, "success", { deploymentId: deployment.id });
        const albHealthResult = await this.albService.waitForHealthyTargets(projectId);
        deployment.metadata = this.safeMetadata({
            ...deployment.metadata,
            albHealth: albHealthResult,
        });
        if (!albHealthResult.healthy) {
            deployment.status = project_deployment_entity_1.ProjectDeploymentStatus.UNHEALTHY;
            deployment.stable = false;
            deployment.errorMessage = albHealthResult.reason || "ALB targets did not become healthy.";
            deployment.failedAt = new Date();
            await this.deploymentRepository.save(deployment);
            await this.event(projectId, pipelineRunId, deployment.id, "alb_targets_unhealthy", "failed", deployment.errorMessage, actorUser || null, albHealthResult);
            await this.audit("ALB_TARGETS_UNHEALTHY", projectId, actorUser || null, "failed", { deploymentId: deployment.id, reason: deployment.errorMessage });
            await this.attemptAutoRollback(projectId, pipelineRunId, deployment, deployment.errorMessage, actorUser || null);
            throw new common_1.BadRequestException(deployment.errorMessage);
        }
        deployment.status = project_deployment_entity_1.ProjectDeploymentStatus.HEALTHY;
        deployment.stable = true;
        deployment.deploymentCompletedAt = new Date();
        await this.deploymentRepository.save(deployment);
        const release = await this.rollbackService.saveStableRelease(projectId, pipelineRunId, run.commitSha, run.ecrImageUri, taskDefinitionArn);
        release.ecsServiceArn = deployment.ecsServiceArn;
        release.healthCheckPath = deployment.healthCheckPath;
        release.appPort = deployment.appPort;
        await this.releaseRepository.save(release);
        await this.event(projectId, pipelineRunId, deployment.id, "deployment_marked_stable", "success", "Deployment marked stable.", actorUser || null, {
            commitSha: run.commitSha,
            taskDefinitionArn,
        });
        await this.audit("DEPLOYMENT_MARKED_STABLE", projectId, actorUser || null, "success", {
            deploymentId: deployment.id,
            commitSha: run.commitSha,
            taskDefinitionArn,
        });
        await this.event(projectId, pipelineRunId, deployment.id, "deployment_completed", "success", "Deployment completed after ECS stability and ALB health checks.", actorUser || null, {
            commitSha: run.commitSha,
            taskDefinitionArn,
        });
        await this.audit("DEPLOYMENT_COMPLETED", projectId, actorUser || null, "success", {
            deploymentId: deployment.id,
            commitSha: run.commitSha,
            taskDefinitionArn,
        });
        return deployment;
    }
    async attemptAutoRollback(projectId, pipelineRunId, deployment, reason, actorUser) {
        const config = (0, orchestration_config_1.getOrchestrationConfig)(this.config);
        if (!config.enableAutoRollback) {
            return null;
        }
        await this.event(projectId, pipelineRunId, deployment.id, "rollback_started", "running", "Automatic rollback started.", actorUser, { reason });
        await this.audit("ROLLBACK_STARTED", projectId, actorUser, "success", { deploymentId: deployment.id, reason });
        try {
            const result = await this.rollbackService.rollbackToPreviousStable(projectId, pipelineRunId, reason);
            await this.event(projectId, pipelineRunId, deployment.id, "rollback_succeeded", "success", "Automatic rollback completed.", actorUser, {
                toCommitSha: result.release.commitSha,
            });
            await this.audit("ROLLBACK_SUCCEEDED", projectId, actorUser, "success", {
                deploymentId: deployment.id,
                toCommitSha: result.release.commitSha,
            });
            return result;
        }
        catch (error) {
            const message = error instanceof Error ? error.message : "Automatic rollback failed.";
            await this.event(projectId, pipelineRunId, deployment.id, "rollback_failed", "failed", message, actorUser, { reason: message });
            await this.audit("ROLLBACK_FAILED", projectId, actorUser, "failed", { deploymentId: deployment.id, reason: message });
            return null;
        }
    }
    async event(projectId, pipelineRunId, deploymentId, eventType, status, message, actorUser, metadata = {}) {
        return this.eventRepository.save(this.eventRepository.create({
            projectId,
            pipelineRunId,
            deploymentId,
            eventType,
            status,
            message,
            actorUserId: actorUser?.id || null,
            metadata: this.safeMetadata({ projectId, pipelineRunId, deploymentId, eventType, status, ...metadata }),
        }));
    }
    async audit(action, projectId, actorUser, status, metadata, req) {
        await this.auditLogService.record({
            actorUser,
            action,
            resourceType: "orchestration",
            resourceId: projectId,
            status,
            metadata: this.safeMetadata({ projectId, ...metadata }),
            req,
        });
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
    safeMetadata(metadata) {
        const allowed = [
            "projectId",
            "pipelineRunId",
            "deploymentId",
            "eventType",
            "status",
            "commitSha",
            "taskDefinitionArn",
            "toCommitSha",
            "reason",
            "minTasks",
            "maxTasks",
            "cpuTargetPercent",
            "spotEventRuleName",
            "spotEventRuleArn",
            "ecsStability",
            "albHealth",
        ];
        return Object.entries(metadata).reduce((safe, [key, value]) => {
            if (allowed.includes(key) && value !== undefined)
                safe[key] = value;
            return safe;
        }, {});
    }
    stringOutput(value) {
        return value === undefined || value === null ? null : String(value);
    }
};
exports.OrchestrationService = OrchestrationService;
exports.OrchestrationService = OrchestrationService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(project_entity_1.Project)),
    __param(1, (0, typeorm_1.InjectRepository)(project_pipeline_run_entity_1.ProjectPipelineRun)),
    __param(2, (0, typeorm_1.InjectRepository)(project_infrastructure_environment_entity_1.ProjectInfrastructureEnvironment)),
    __param(3, (0, typeorm_1.InjectRepository)(project_deployment_entity_1.ProjectDeployment)),
    __param(4, (0, typeorm_1.InjectRepository)(project_stable_release_entity_1.ProjectStableRelease)),
    __param(5, (0, typeorm_1.InjectRepository)(project_orchestration_event_entity_1.ProjectOrchestrationEvent)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        infrastructure_service_1.InfrastructureService,
        config_1.ConfigService,
        audit_log_service_1.AuditLogService,
        ecs_service_1.EcsService,
        alb_service_1.AlbService,
        autoscaling_service_1.AutoscalingService,
        rollback_service_1.RollbackService,
        spot_interruption_service_1.SpotInterruptionService])
], OrchestrationService);
//# sourceMappingURL=orchestration.service.js.map