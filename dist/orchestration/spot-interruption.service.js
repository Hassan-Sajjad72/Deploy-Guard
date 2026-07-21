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
exports.SpotInterruptionService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const audit_log_service_1 = require("../audit-log/audit-log.service");
const ecs_service_1 = require("./ecs.service");
const project_deployment_entity_1 = require("./project-deployment.entity");
const project_orchestration_event_entity_1 = require("./project-orchestration-event.entity");
const project_spot_interruption_event_entity_1 = require("./project-spot-interruption-event.entity");
const orchestration_config_1 = require("./orchestration.config");
let SpotInterruptionService = class SpotInterruptionService {
    constructor(deploymentRepository, eventRepository, spotRepository, config, auditLogService, ecsService) {
        this.deploymentRepository = deploymentRepository;
        this.eventRepository = eventRepository;
        this.spotRepository = spotRepository;
        this.config = config;
        this.auditLogService = auditLogService;
        this.ecsService = ecsService;
    }
    async configureEventBridgeRule(projectId) {
        return { projectId, status: "terraform_managed" };
    }
    async handleSpotInterruptionEvent(projectId, event, secret) {
        const config = (0, orchestration_config_1.getOrchestrationConfig)(this.config);
        if (!config.spotEventWebhookSecret) {
            throw new common_1.BadRequestException("Spot event webhook secret is not configured.");
        }
        if (secret !== config.spotEventWebhookSecret) {
            throw new common_1.UnauthorizedException("Invalid spot event webhook secret.");
        }
        const detail = (event.detail || {});
        const taskArn = String(detail.taskArn || detail.task || "");
        const reason = String(detail.stoppedReason || detail.stopCode || "ECS task interruption or service event received.");
        const deployment = await this.deploymentRepository.findOne({
            where: { projectId },
            order: { createdAt: "DESC" },
        });
        const saved = await this.recordSpotInterruption(projectId, taskArn || null, reason, {
            eventId: String(event.id || ""),
            eventTime: event.time ? new Date(String(event.time)) : null,
            deployment,
            detailType: String(event["detail-type"] || ""),
        });
        const recentHandled = await this.findRecentHandledEvent(projectId, config.spotRecoveryCooldownSeconds);
        try {
            if (recentHandled) {
                saved.status = project_spot_interruption_event_entity_1.SpotInterruptionStatus.HANDLED;
                saved.metadata = this.safeMetadata({
                    ...saved.metadata,
                    cooldownSkipped: true,
                    recentSpotEventId: recentHandled.id,
                });
                await this.spotRepository.save(saved);
                await this.eventRepository.save(this.eventRepository.create({
                    projectId,
                    pipelineRunId: deployment?.pipelineRunId || null,
                    deploymentId: deployment?.id || null,
                    eventType: "spot_interruption_recovery_skipped",
                    status: "success",
                    message: "Spot recovery skipped because a recent replacement request already ran.",
                    metadata: this.safeMetadata({ deploymentId: deployment?.id, cooldownSkipped: true, recentSpotEventId: recentHandled.id }),
                }));
                await this.auditLogService.record({
                    actorUser: null,
                    action: "SPOT_INTERRUPTION_RECOVERY_SKIPPED",
                    resourceType: "orchestration",
                    resourceId: projectId,
                    status: "success",
                    metadata: this.safeMetadata({ projectId, deploymentId: deployment?.id, eventId: saved.eventId, cooldownSkipped: true }),
                });
                return saved;
            }
            await this.triggerReplacementTaskOrForceDeployment(projectId);
            saved.status = project_spot_interruption_event_entity_1.SpotInterruptionStatus.HANDLED;
            await this.spotRepository.save(saved);
            await this.eventRepository.save(this.eventRepository.create({
                projectId,
                pipelineRunId: deployment?.pipelineRunId || null,
                deploymentId: deployment?.id || null,
                eventType: "spot_interruption_handled",
                status: "success",
                message: "Spot interruption handled after ECS replacement deployment request.",
                metadata: this.safeMetadata({ deploymentId: deployment?.id, eventId: saved.eventId }),
            }));
            await this.auditLogService.record({
                actorUser: null,
                action: "SPOT_INTERRUPTION_HANDLED",
                resourceType: "orchestration",
                resourceId: projectId,
                status: "success",
                metadata: this.safeMetadata({ projectId, deploymentId: deployment?.id, eventId: saved.eventId }),
            });
        }
        catch (error) {
            const message = this.failureMessage(error, "Spot interruption recovery failed.");
            saved.status = project_spot_interruption_event_entity_1.SpotInterruptionStatus.FAILED;
            saved.metadata = this.safeMetadata({ ...saved.metadata, reason: message });
            await this.spotRepository.save(saved);
            await this.eventRepository.save(this.eventRepository.create({
                projectId,
                pipelineRunId: deployment?.pipelineRunId || null,
                deploymentId: deployment?.id || null,
                eventType: "spot_interruption_recovery_failed",
                status: "failed",
                message,
                metadata: this.safeMetadata({ deploymentId: deployment?.id, eventId: saved.eventId, reason: message }),
            }));
            await this.auditLogService.record({
                actorUser: null,
                action: "SPOT_INTERRUPTION_RECOVERY_FAILED",
                resourceType: "orchestration",
                resourceId: projectId,
                status: "failed",
                metadata: this.safeMetadata({ projectId, deploymentId: deployment?.id, eventId: saved.eventId, reason: message }),
            });
            throw error;
        }
        return saved;
    }
    async recordSpotInterruption(projectId, taskArn, reason, options = {}) {
        const deployment = options.deployment || await this.deploymentRepository.findOne({
            where: { projectId },
            order: { createdAt: "DESC" },
        });
        const saved = await this.spotRepository.save(this.spotRepository.create({
            projectId,
            deploymentId: deployment?.id || null,
            pipelineRunId: deployment?.pipelineRunId || null,
            ecsClusterArn: deployment?.ecsClusterArn || null,
            ecsServiceArn: deployment?.ecsServiceArn || null,
            taskArn,
            eventId: options.eventId || null,
            eventTime: options.eventTime || null,
            reason,
            status: project_spot_interruption_event_entity_1.SpotInterruptionStatus.RECEIVED,
            metadata: this.safeMetadata({ detailType: options.detailType || null }),
        }));
        if (deployment) {
            deployment.status = project_deployment_entity_1.ProjectDeploymentStatus.INTERRUPTED;
            await this.deploymentRepository.save(deployment);
        }
        await this.eventRepository.save(this.eventRepository.create({
            projectId,
            pipelineRunId: deployment?.pipelineRunId || null,
            deploymentId: deployment?.id || null,
            eventType: "spot_interruption_detected",
            status: "warning",
            message: reason,
            metadata: this.safeMetadata({
                taskArn,
                eventId: options.eventId,
                detailType: options.detailType,
            }),
        }));
        await this.auditLogService.record({
            actorUser: null,
            action: "SPOT_INTERRUPTION_DETECTED",
            resourceType: "orchestration",
            resourceId: projectId,
            status: "success",
            metadata: this.safeMetadata({ projectId, deploymentId: deployment?.id, taskArn, eventId: options.eventId }),
        });
        return saved;
    }
    async triggerReplacementTaskOrForceDeployment(projectId) {
        const deployment = await this.deploymentRepository.findOne({
            where: { projectId },
            order: { createdAt: "DESC" },
        });
        const result = await this.ecsService.forceNewDeployment(projectId);
        if (deployment) {
            deployment.status = project_deployment_entity_1.ProjectDeploymentStatus.DEPLOYING;
            await this.deploymentRepository.save(deployment);
        }
        await this.eventRepository.save(this.eventRepository.create({
            projectId,
            pipelineRunId: deployment?.pipelineRunId || null,
            deploymentId: deployment?.id || null,
            eventType: "replacement_task_triggered",
            status: "success",
            message: "Replacement task or ECS force deployment requested.",
            metadata: this.safeMetadata({ deploymentId: deployment?.id, serviceArn: result.serviceArn }),
        }));
        await this.auditLogService.record({
            actorUser: null,
            action: "REPLACEMENT_TASK_TRIGGERED",
            resourceType: "orchestration",
            resourceId: projectId,
            status: "success",
            metadata: this.safeMetadata({ projectId, deploymentId: deployment?.id, serviceArn: result.serviceArn }),
        });
        return { projectId, deploymentId: deployment?.id || null, status: "replacement_triggered" };
    }
    async list(projectId) {
        return this.spotRepository.find({
            where: { projectId },
            order: { createdAt: "DESC" },
            take: 50,
        });
    }
    safeMetadata(metadata) {
        const allowed = [
            "projectId",
            "deploymentId",
            "taskArn",
            "eventId",
            "detailType",
            "serviceArn",
            "reason",
            "cooldownSkipped",
            "recentSpotEventId",
        ];
        return Object.entries(metadata).reduce((safe, [key, value]) => {
            if (allowed.includes(key) && value !== undefined)
                safe[key] = value;
            return safe;
        }, {});
    }
    findRecentHandledEvent(projectId, cooldownSeconds) {
        if (cooldownSeconds <= 0) {
            return null;
        }
        return this.spotRepository.findOne({
            where: {
                projectId,
                status: project_spot_interruption_event_entity_1.SpotInterruptionStatus.HANDLED,
                createdAt: (0, typeorm_2.MoreThan)(new Date(Date.now() - cooldownSeconds * 1000)),
            },
            order: { createdAt: "DESC" },
        });
    }
    failureMessage(error, fallback) {
        if (!error || typeof error !== "object") {
            return fallback;
        }
        const awsError = error;
        return awsError.name ? `${fallback} ${awsError.name}` : fallback;
    }
};
exports.SpotInterruptionService = SpotInterruptionService;
exports.SpotInterruptionService = SpotInterruptionService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(project_deployment_entity_1.ProjectDeployment)),
    __param(1, (0, typeorm_1.InjectRepository)(project_orchestration_event_entity_1.ProjectOrchestrationEvent)),
    __param(2, (0, typeorm_1.InjectRepository)(project_spot_interruption_event_entity_1.ProjectSpotInterruptionEvent)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        config_1.ConfigService,
        audit_log_service_1.AuditLogService,
        ecs_service_1.EcsService])
], SpotInterruptionService);
//# sourceMappingURL=spot-interruption.service.js.map