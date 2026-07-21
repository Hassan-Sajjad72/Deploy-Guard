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
exports.AutoscalingService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const client_application_auto_scaling_1 = require("@aws-sdk/client-application-auto-scaling");
const client_ecs_1 = require("@aws-sdk/client-ecs");
const typeorm_2 = require("typeorm");
const audit_log_service_1 = require("../audit-log/audit-log.service");
const project_deployment_entity_1 = require("./project-deployment.entity");
const project_orchestration_event_entity_1 = require("./project-orchestration-event.entity");
let AutoscalingService = class AutoscalingService {
    constructor(deploymentRepository, eventRepository, config, auditLogService) {
        this.deploymentRepository = deploymentRepository;
        this.eventRepository = eventRepository;
        this.config = config;
        this.auditLogService = auditLogService;
    }
    async configureTargetTrackingCpu(projectId, clusterName, serviceName) {
        return { projectId, clusterName, serviceName, status: "terraform_managed" };
    }
    async updateScalingPolicy(projectId, minTasks, maxTasks, cpuTargetPercent) {
        if (minTasks < 1 || maxTasks < minTasks || maxTasks > 20) {
            throw new common_1.BadRequestException("Scaling limits must be between 1 and 20 tasks, with max >= min.");
        }
        if (cpuTargetPercent < 10 || cpuTargetPercent > 90) {
            throw new common_1.BadRequestException("CPU target percent must be between 10 and 90.");
        }
        const deployment = await this.deploymentRepository.findOne({
            where: { projectId },
            order: { createdAt: "DESC" },
        });
        if (!deployment?.ecsClusterName || !deployment.ecsServiceName) {
            throw new common_1.BadRequestException("ECS cluster and service names are required before scaling can be updated.");
        }
        const resourceId = `service/${deployment.ecsClusterName}/${deployment.ecsServiceName}`;
        await this.event(projectId, deployment.pipelineRunId || null, deployment.id, "autoscaling_policy_update_started", "running", "Updating live ECS auto-scaling policy.", {
            minTasks,
            maxTasks,
            cpuTargetPercent,
        });
        await this.audit("SCALING_POLICY_UPDATE_STARTED", projectId, "success", {
            deploymentId: deployment.id,
            minTasks,
            maxTasks,
            cpuTargetPercent,
        });
        try {
            await this.autoscalingClient().send(new client_application_auto_scaling_1.RegisterScalableTargetCommand({
                ServiceNamespace: "ecs",
                ScalableDimension: "ecs:service:DesiredCount",
                ResourceId: resourceId,
                MinCapacity: minTasks,
                MaxCapacity: maxTasks,
            }));
            await this.autoscalingClient().send(new client_application_auto_scaling_1.PutScalingPolicyCommand({
                PolicyName: `deployguard-${projectId}-cpu-target-tracking`,
                PolicyType: "TargetTrackingScaling",
                ServiceNamespace: "ecs",
                ScalableDimension: "ecs:service:DesiredCount",
                ResourceId: resourceId,
                TargetTrackingScalingPolicyConfiguration: {
                    TargetValue: cpuTargetPercent,
                    PredefinedMetricSpecification: {
                        PredefinedMetricType: "ECSServiceAverageCPUUtilization",
                    },
                    ScaleInCooldown: 60,
                    ScaleOutCooldown: 60,
                },
            }));
            if ((deployment.desiredCount || 1) < minTasks) {
                await this.ecsClient().send(new client_ecs_1.UpdateServiceCommand({
                    cluster: deployment.ecsClusterName,
                    service: deployment.ecsServiceName,
                    desiredCount: minTasks,
                }));
                deployment.desiredCount = minTasks;
            }
            deployment.minTasks = minTasks;
            deployment.maxTasks = maxTasks;
            deployment.cpuTargetPercent = cpuTargetPercent;
            deployment.status = project_deployment_entity_1.ProjectDeploymentStatus.SCALED;
            await this.deploymentRepository.save(deployment);
            const result = { projectId, minTasks, maxTasks, cpuTargetPercent, status: "updated" };
            await this.event(projectId, deployment.pipelineRunId || null, deployment.id, "autoscaling_policy_configured", "success", "Live ECS auto-scaling policy updated.", result);
            await this.audit("SCALING_POLICY_UPDATED", projectId, "success", {
                deploymentId: deployment.id,
                minTasks,
                maxTasks,
                cpuTargetPercent,
            });
            return result;
        }
        catch (error) {
            const message = this.failureMessage(error, "Failed to update live ECS auto-scaling policy.");
            await this.event(projectId, deployment.pipelineRunId || null, deployment.id, "autoscaling_policy_update_failed", "failed", message, {
                minTasks,
                maxTasks,
                cpuTargetPercent,
            });
            await this.audit("SCALING_POLICY_UPDATE_FAILED", projectId, "failed", {
                deploymentId: deployment.id,
                minTasks,
                maxTasks,
                cpuTargetPercent,
                reason: message,
            });
            throw new common_1.BadRequestException(message);
        }
    }
    async getScalingStatus(projectId) {
        const deployment = await this.deploymentRepository.findOne({
            where: { projectId },
            order: { createdAt: "DESC" },
        });
        return {
            minTasks: deployment?.minTasks || 1,
            maxTasks: deployment?.maxTasks || 3,
            cpuTargetPercent: deployment?.cpuTargetPercent || 60,
            desiredCount: deployment?.desiredCount || 1,
            capacityProviderStrategy: deployment?.capacityProviderStrategy || [],
            status: deployment ? deployment.status : "not_configured",
        };
    }
    autoscalingClient() {
        return new client_application_auto_scaling_1.ApplicationAutoScalingClient({
            region: this.config.get("AWS_REGION", "us-east-1"),
        });
    }
    ecsClient() {
        return new client_ecs_1.ECSClient({
            region: this.config.get("AWS_REGION", "us-east-1"),
        });
    }
    async event(projectId, pipelineRunId, deploymentId, eventType, status, message, metadata = {}) {
        await this.eventRepository.save(this.eventRepository.create({
            projectId,
            pipelineRunId,
            deploymentId,
            eventType,
            status,
            message,
            metadata: this.safeMetadata({ projectId, deploymentId, eventType, status, ...metadata }),
        }));
    }
    async audit(action, projectId, status, metadata) {
        await this.auditLogService.record({
            actorUser: null,
            action,
            resourceType: "orchestration",
            resourceId: projectId,
            status,
            metadata: this.safeMetadata({ projectId, ...metadata }),
        });
    }
    safeMetadata(metadata) {
        const allowed = [
            "projectId",
            "deploymentId",
            "eventType",
            "status",
            "minTasks",
            "maxTasks",
            "cpuTargetPercent",
            "reason",
        ];
        return Object.entries(metadata).reduce((safe, [key, value]) => {
            if (allowed.includes(key) && value !== undefined)
                safe[key] = value;
            return safe;
        }, {});
    }
    failureMessage(error, fallback) {
        if (!error || typeof error !== "object") {
            return fallback;
        }
        const awsError = error;
        return awsError.name ? `${fallback} ${awsError.name}` : fallback;
    }
};
exports.AutoscalingService = AutoscalingService;
exports.AutoscalingService = AutoscalingService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(project_deployment_entity_1.ProjectDeployment)),
    __param(1, (0, typeorm_1.InjectRepository)(project_orchestration_event_entity_1.ProjectOrchestrationEvent)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        config_1.ConfigService,
        audit_log_service_1.AuditLogService])
], AutoscalingService);
//# sourceMappingURL=autoscaling.service.js.map