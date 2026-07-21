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
exports.AlbService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const client_elastic_load_balancing_v2_1 = require("@aws-sdk/client-elastic-load-balancing-v2");
const typeorm_2 = require("typeorm");
const audit_log_service_1 = require("../audit-log/audit-log.service");
const project_deployment_entity_1 = require("./project-deployment.entity");
const project_orchestration_event_entity_1 = require("./project-orchestration-event.entity");
const orchestration_config_1 = require("./orchestration.config");
let AlbService = class AlbService {
    constructor(deploymentRepository, eventRepository, config, auditLogService) {
        this.deploymentRepository = deploymentRepository;
        this.eventRepository = eventRepository;
        this.config = config;
        this.auditLogService = auditLogService;
    }
    async createOrUpdateAlb(projectId, infrastructureOutputs) {
        return { projectId, albArn: infrastructureOutputs.alb_arn || null };
    }
    async createOrUpdateTargetGroup(projectId, healthCheckPath, appPort) {
        return { projectId, healthCheckPath, appPort, status: "terraform_managed" };
    }
    async createOrUpdateListener(projectId) {
        return { projectId, status: "terraform_managed" };
    }
    async getTargetHealth(projectId) {
        const deployment = await this.deploymentRepository.findOne({
            where: { projectId },
            order: { createdAt: "DESC" },
        });
        if (!deployment?.targetGroupArn) {
            return {
                targetGroupArn: null,
                healthCheckPath: deployment?.healthCheckPath || "/health",
                status: "not_configured",
                albDnsName: deployment?.albDnsName || null,
                healthyCount: 0,
                unhealthyCount: 0,
                targetStates: [],
            };
        }
        const health = await this.describeTargetHealth(deployment.targetGroupArn).catch((error) => this.unhealthyResult(deployment.targetGroupArn, this.failureReason(error, "Failed to describe ALB target health.")));
        return {
            ...health,
            status: health.healthy ? "healthy" : "unhealthy",
            healthCheckPath: deployment.healthCheckPath || "/health",
            albDnsName: deployment.albDnsName || null,
        };
    }
    async waitForHealthyTargets(projectId) {
        const deployment = await this.deploymentRepository.findOne({
            where: { projectId },
            order: { createdAt: "DESC" },
        });
        const config = (0, orchestration_config_1.getOrchestrationConfig)(this.config);
        const timeoutMs = config.albHealthTimeoutSeconds * 1000;
        const pollMs = config.albHealthPollIntervalSeconds * 1000;
        const startedAt = Date.now();
        const targetGroupArn = deployment?.targetGroupArn || null;
        await this.event(projectId, deployment?.pipelineRunId || null, deployment?.id || null, "alb_health_check_wait_started", "running", "Waiting for ALB target health.");
        await this.audit("ALB_HEALTH_CHECK_WAIT_STARTED", projectId, "success", { deploymentId: deployment?.id });
        if (!targetGroupArn) {
            const missing = this.unhealthyResult(null, "ALB target group ARN is missing.");
            await this.event(projectId, deployment?.pipelineRunId || null, deployment?.id || null, "alb_health_check_failed", "failed", missing.reason, missing);
            await this.audit("ALB_HEALTH_CHECK_FAILED", projectId, "failed", missing);
            return missing;
        }
        while (Date.now() - startedAt <= timeoutMs) {
            let result;
            try {
                result = await this.describeTargetHealth(targetGroupArn);
            }
            catch (error) {
                result = this.unhealthyResult(targetGroupArn, this.failureReason(error, "Failed to describe ALB target health."));
                await this.event(projectId, deployment?.pipelineRunId || null, deployment?.id || null, "alb_health_check_failed", "failed", result.reason, result);
                await this.audit("ALB_HEALTH_CHECK_FAILED", projectId, "failed", result);
                return result;
            }
            await this.event(projectId, deployment?.pipelineRunId || null, deployment?.id || null, "alb_target_health_check", result.healthy ? "success" : "running", result.reason || "ALB target health checked.", result);
            await this.audit("ALB_TARGET_HEALTH_CHECKED", projectId, "success", result);
            if (result.healthy) {
                await this.event(projectId, deployment?.pipelineRunId || null, deployment?.id || null, "alb_targets_healthy", "success", "ALB targets are healthy.", result);
                await this.audit("ALB_TARGETS_HEALTHY", projectId, "success", result);
                return result;
            }
            await this.sleep(pollMs);
        }
        const timeout = await this.describeTargetHealth(targetGroupArn).catch(() => this.unhealthyResult(targetGroupArn, "Timed out waiting for ALB targets to become healthy."));
        timeout.healthy = false;
        timeout.reason = timeout.reason || "Timed out waiting for ALB targets to become healthy.";
        await this.event(projectId, deployment?.pipelineRunId || null, deployment?.id || null, "alb_health_check_timeout", "failed", timeout.reason, timeout);
        await this.audit("ALB_HEALTH_CHECK_TIMEOUT", projectId, "failed", timeout);
        return timeout;
    }
    async describeTargetHealth(targetGroupArn) {
        const response = await this.elbClient().send(new client_elastic_load_balancing_v2_1.DescribeTargetHealthCommand({ TargetGroupArn: targetGroupArn }));
        const targetStates = (response.TargetHealthDescriptions || []).map((target) => ({
            targetId: target.Target?.Id || null,
            port: target.Target?.Port || null,
            state: target.TargetHealth?.State || null,
            reason: target.TargetHealth?.Reason || null,
            description: target.TargetHealth?.Description || null,
        }));
        const healthyCount = targetStates.filter((target) => target.state === "healthy").length;
        const unhealthyCount = targetStates.filter((target) => target.state && target.state !== "healthy").length;
        const healthy = targetStates.length > 0 && healthyCount === targetStates.length && unhealthyCount === 0;
        return {
            healthy,
            reason: healthy
                ? undefined
                : targetStates.length === 0
                    ? "No ALB targets are registered yet."
                    : "One or more ALB targets are not healthy.",
            targetGroupArn,
            healthyCount,
            unhealthyCount,
            targetStates,
            checkedAt: new Date().toISOString(),
        };
    }
    unhealthyResult(targetGroupArn, reason) {
        return {
            healthy: false,
            reason,
            targetGroupArn,
            healthyCount: 0,
            unhealthyCount: 0,
            targetStates: [],
            checkedAt: new Date().toISOString(),
        };
    }
    elbClient() {
        return new client_elastic_load_balancing_v2_1.ElasticLoadBalancingV2Client({
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
            "healthy",
            "reason",
            "targetGroupArn",
            "healthyCount",
            "unhealthyCount",
            "targetStates",
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
exports.AlbService = AlbService;
exports.AlbService = AlbService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(project_deployment_entity_1.ProjectDeployment)),
    __param(1, (0, typeorm_1.InjectRepository)(project_orchestration_event_entity_1.ProjectOrchestrationEvent)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        config_1.ConfigService,
        audit_log_service_1.AuditLogService])
], AlbService);
//# sourceMappingURL=alb.service.js.map