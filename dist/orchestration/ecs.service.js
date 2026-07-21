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
exports.EcsService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const client_ecs_1 = require("@aws-sdk/client-ecs");
const typeorm_2 = require("typeorm");
const audit_log_service_1 = require("../audit-log/audit-log.service");
const project_deployment_entity_1 = require("./project-deployment.entity");
const project_orchestration_event_entity_1 = require("./project-orchestration-event.entity");
const orchestration_config_1 = require("./orchestration.config");
let EcsService = class EcsService {
    constructor(deploymentRepository, eventRepository, config, auditLogService) {
        this.deploymentRepository = deploymentRepository;
        this.eventRepository = eventRepository;
        this.config = config;
        this.auditLogService = auditLogService;
    }
    async createOrUpdateCluster(projectId, environmentName = "dev") {
        return { projectId, environmentName, status: "terraform_managed" };
    }
    async registerTaskDefinition(projectId, imageUri, deploymentProfile) {
        return { projectId, imageUri, deploymentProfile, status: "terraform_managed" };
    }
    async createOrUpdateService(projectId, taskDefinitionArn, infrastructureOutputs) {
        return { projectId, taskDefinitionArn, infrastructureOutputs, status: "terraform_managed" };
    }
    async waitForServiceStability(projectId, serviceArn) {
        const deployment = await this.getServiceStatus(projectId);
        const orchestrationConfig = (0, orchestration_config_1.getOrchestrationConfig)(this.config);
        const timeoutMs = orchestrationConfig.serviceStabilityTimeoutSeconds * 1000;
        const pollMs = orchestrationConfig.serviceStabilityPollIntervalSeconds * 1000;
        const startedAt = Date.now();
        const cluster = deployment?.ecsClusterArn || deployment?.ecsClusterName;
        const service = serviceArn || deployment?.ecsServiceArn || deployment?.ecsServiceName;
        await this.event(projectId, deployment?.pipelineRunId || null, deployment?.id || null, "ecs_service_stability_wait_started", "running", "Waiting for ECS service stability.");
        await this.audit("ECS_SERVICE_STABILITY_WAIT_STARTED", projectId, "success", { deploymentId: deployment?.id });
        if (!cluster || !service) {
            const missing = this.unstableResult(service || null, "ECS cluster or service is missing.");
            await this.event(projectId, deployment?.pipelineRunId || null, deployment?.id || null, "ecs_service_stability_failed", "failed", missing.reason, missing);
            await this.audit("ECS_SERVICE_STABILITY_FAILED", projectId, "failed", missing);
            return missing;
        }
        while (Date.now() - startedAt <= timeoutMs) {
            let result;
            try {
                result = await this.describeServiceStability(projectId, cluster, service, deployment);
            }
            catch (error) {
                result = this.unstableResult(service, this.failureReason(error, "Failed to describe ECS service stability."));
                await this.event(projectId, deployment?.pipelineRunId || null, deployment?.id || null, "ecs_service_stability_failed", "failed", result.reason, result);
                await this.audit("ECS_SERVICE_STABILITY_FAILED", projectId, "failed", result);
                return result;
            }
            await this.event(projectId, deployment?.pipelineRunId || null, deployment?.id || null, "ecs_service_stability_check", result.stable ? "success" : "running", result.reason || "ECS service stability checked.", result);
            await this.audit("ECS_SERVICE_STABILITY_CHECKED", projectId, "success", result);
            if (result.stable) {
                await this.event(projectId, deployment?.pipelineRunId || null, deployment?.id || null, "ecs_service_stable", "success", "ECS service reached stable state.", result);
                await this.audit("ECS_SERVICE_STABLE", projectId, "success", result);
                return result;
            }
            if (result.rolloutState === "FAILED") {
                await this.event(projectId, deployment?.pipelineRunId || null, deployment?.id || null, "ecs_service_deployment_failed", "failed", result.reason || "ECS service deployment failed.", result);
                await this.audit("ECS_SERVICE_DEPLOYMENT_FAILED", projectId, "failed", result);
                return result;
            }
            await this.sleep(pollMs);
        }
        const timeout = this.unstableResult(service, "Timed out waiting for ECS service stability.");
        await this.event(projectId, deployment?.pipelineRunId || null, deployment?.id || null, "ecs_service_stability_timeout", "failed", timeout.reason, timeout);
        await this.audit("ECS_SERVICE_STABILITY_TIMEOUT", projectId, "failed", timeout);
        return timeout;
    }
    async getServiceStatus(projectId) {
        return this.deploymentRepository.findOne({
            where: { projectId },
            order: { createdAt: "DESC" },
        });
    }
    async forceNewDeployment(projectId) {
        const deployment = await this.getServiceStatus(projectId);
        const cluster = deployment?.ecsClusterArn || deployment?.ecsClusterName;
        const service = deployment?.ecsServiceArn || deployment?.ecsServiceName;
        if (!cluster || !service) {
            throw new Error("ECS cluster or service is missing for force deployment.");
        }
        const response = await this.ecsClient().send(new client_ecs_1.UpdateServiceCommand({
            cluster,
            service,
            forceNewDeployment: true,
            desiredCount: deployment?.desiredCount || undefined,
        }));
        return {
            projectId,
            deploymentId: deployment?.id || null,
            status: "force_deployment_requested",
            serviceArn: response.service?.serviceArn || deployment?.ecsServiceArn || null,
        };
    }
    async updateServiceToTaskDefinition(projectId, taskDefinitionArn) {
        const deployment = await this.getServiceStatus(projectId);
        const cluster = deployment?.ecsClusterArn || deployment?.ecsClusterName;
        const service = deployment?.ecsServiceArn || deployment?.ecsServiceName;
        if (deployment) {
            if (!cluster || !service) {
                throw new Error("ECS cluster or service is missing for rollback update.");
            }
            await this.ecsClient().send(new client_ecs_1.UpdateServiceCommand({
                cluster,
                service,
                taskDefinition: taskDefinitionArn,
                forceNewDeployment: true,
            }));
            deployment.previousTaskDefinitionArn = deployment.taskDefinitionArn;
            deployment.taskDefinitionArn = taskDefinitionArn;
            deployment.status = project_deployment_entity_1.ProjectDeploymentStatus.ROLLBACK_STARTED;
            await this.deploymentRepository.save(deployment);
        }
        return { projectId, taskDefinitionArn, status: "service_update_requested" };
    }
    async getTaskEvents(projectId) {
        const deployment = await this.getServiceStatus(projectId);
        return deployment?.metadata?.taskEvents || [];
    }
    async describeServiceStability(projectId, cluster, service, deployment) {
        const response = await this.ecsClient().send(new client_ecs_1.DescribeServicesCommand({
            cluster,
            services: [service],
        }));
        const described = response.services?.[0];
        if (!described) {
            return this.unstableResult(service, "ECS service was not found.");
        }
        const deployments = (described.deployments || []).map((item) => ({
            id: item.id || null,
            status: item.status || null,
            rolloutState: item.rolloutState || null,
            desiredCount: item.desiredCount || 0,
            runningCount: item.runningCount || 0,
            pendingCount: item.pendingCount || 0,
            taskDefinition: item.taskDefinition || null,
            updatedAt: item.updatedAt?.toISOString() || null,
        }));
        const primary = (described.deployments || []).find((item) => item.status === "PRIMARY");
        const failed = (described.deployments || []).find((item) => item.rolloutState === "FAILED");
        const desiredCount = described.desiredCount || 0;
        const runningCount = described.runningCount || 0;
        const pendingCount = described.pendingCount || 0;
        const rolloutState = failed?.rolloutState || primary?.rolloutState || null;
        const serviceActive = described.status === "ACTIVE";
        const primaryComplete = !primary?.rolloutState || primary.rolloutState === "COMPLETED";
        const stable = serviceActive && runningCount >= desiredCount && pendingCount === 0 && primaryComplete && !failed;
        const reason = stable
            ? undefined
            : failed
                ? failed.rolloutStateReason || "ECS deployment rollout failed."
                : "ECS service is not stable yet.";
        return {
            stable,
            reason,
            serviceArn: described.serviceArn || deployment?.ecsServiceArn || service || null,
            desiredCount,
            runningCount,
            pendingCount,
            rolloutState,
            deployments,
            checkedAt: new Date().toISOString(),
        };
    }
    unstableResult(serviceArn, reason) {
        return {
            stable: false,
            reason,
            serviceArn,
            desiredCount: 0,
            runningCount: 0,
            pendingCount: 0,
            rolloutState: null,
            deployments: [],
            checkedAt: new Date().toISOString(),
        };
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
            "stable",
            "reason",
            "serviceArn",
            "desiredCount",
            "runningCount",
            "pendingCount",
            "rolloutState",
            "deployments",
            "checkedAt",
        ];
        return Object.entries(metadata).reduce((safe, [key, value]) => {
            if (allowed.includes(key) && value !== undefined) {
                safe[key] = value;
            }
            return safe;
        }, {});
    }
    sleep(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
    failureReason(error, fallback) {
        if (!error || typeof error !== "object") {
            return fallback;
        }
        const awsError = error;
        return awsError.name ? `${fallback} ${awsError.name}` : fallback;
    }
};
exports.EcsService = EcsService;
exports.EcsService = EcsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(project_deployment_entity_1.ProjectDeployment)),
    __param(1, (0, typeorm_1.InjectRepository)(project_orchestration_event_entity_1.ProjectOrchestrationEvent)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        config_1.ConfigService,
        audit_log_service_1.AuditLogService])
], EcsService);
//# sourceMappingURL=ecs.service.js.map