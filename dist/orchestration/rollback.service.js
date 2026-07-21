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
exports.RollbackService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const audit_log_service_1 = require("../audit-log/audit-log.service");
const alb_service_1 = require("./alb.service");
const ecs_service_1 = require("./ecs.service");
const project_deployment_entity_1 = require("./project-deployment.entity");
const project_orchestration_event_entity_1 = require("./project-orchestration-event.entity");
const project_rollback_record_entity_1 = require("./project-rollback-record.entity");
const project_stable_release_entity_1 = require("./project-stable-release.entity");
let RollbackService = class RollbackService {
    constructor(deploymentRepository, releaseRepository, rollbackRepository, eventRepository, ecsService, albService, auditLogService) {
        this.deploymentRepository = deploymentRepository;
        this.releaseRepository = releaseRepository;
        this.rollbackRepository = rollbackRepository;
        this.eventRepository = eventRepository;
        this.ecsService = ecsService;
        this.albService = albService;
        this.auditLogService = auditLogService;
    }
    async saveStableRelease(projectId, pipelineRunId, commitSha, imageUri, taskDefinitionArn) {
        await this.releaseRepository.update({ projectId, environmentName: "dev", status: project_stable_release_entity_1.StableReleaseStatus.STABLE }, { status: project_stable_release_entity_1.StableReleaseStatus.SUPERSEDED });
        return this.releaseRepository.save(this.releaseRepository.create({
            projectId,
            environmentName: "dev",
            commitSha,
            shortCommitSha: commitSha.slice(0, 12),
            imageUri,
            taskDefinitionArn,
            deployedByPipelineRunId: pipelineRunId,
            deployedAt: new Date(),
            status: project_stable_release_entity_1.StableReleaseStatus.STABLE,
        }));
    }
    async getPreviousStableRelease(projectId, excludeCommitSha) {
        return this.releaseRepository.findOne({
            where: {
                projectId,
                environmentName: "dev",
                status: (0, typeorm_2.In)([project_stable_release_entity_1.StableReleaseStatus.STABLE, project_stable_release_entity_1.StableReleaseStatus.SUPERSEDED, project_stable_release_entity_1.StableReleaseStatus.ROLLBACK_TARGET]),
                ...(excludeCommitSha ? { commitSha: (0, typeorm_2.Not)(excludeCommitSha) } : {}),
            },
            order: { deployedAt: "DESC" },
        });
    }
    async markDeploymentUnstable(projectId, pipelineRunId, reason) {
        const deployment = await this.deploymentRepository.findOne({
            where: { projectId, pipelineRunId: pipelineRunId || undefined },
            order: { createdAt: "DESC" },
        });
        if (deployment) {
            deployment.status = project_deployment_entity_1.ProjectDeploymentStatus.UNHEALTHY;
            deployment.stable = false;
            deployment.errorMessage = reason;
            deployment.failedAt = new Date();
            await this.deploymentRepository.save(deployment);
        }
        return deployment;
    }
    async rollbackToPreviousStable(projectId, pipelineRunId, reason = "Rollback requested.") {
        const deployment = await this.deploymentRepository.findOne({
            where: { projectId },
            order: { createdAt: "DESC" },
        });
        if (!deployment) {
            throw new common_1.BadRequestException("No deployment exists for rollback.");
        }
        const target = await this.getPreviousStableRelease(projectId, deployment.commitSha);
        if (!target) {
            deployment.status = project_deployment_entity_1.ProjectDeploymentStatus.ROLLBACK_FAILED;
            deployment.rollbackStartedAt = new Date();
            deployment.rollbackCompletedAt = new Date();
            deployment.errorMessage = "No previous stable release available for rollback.";
            await this.deploymentRepository.save(deployment);
            throw new common_1.BadRequestException("No previous stable release available for rollback.");
        }
        deployment.status = project_deployment_entity_1.ProjectDeploymentStatus.ROLLBACK_STARTED;
        deployment.rollbackStartedAt = new Date();
        deployment.previousTaskDefinitionArn = deployment.taskDefinitionArn;
        await this.deploymentRepository.save(deployment);
        const record = await this.rollbackRepository.save(this.rollbackRepository.create({
            projectId,
            deploymentId: deployment.id,
            pipelineRunId: pipelineRunId || deployment.pipelineRunId || null,
            fromCommitSha: deployment.commitSha,
            toCommitSha: target.commitSha,
            fromTaskDefinitionArn: deployment.taskDefinitionArn,
            toTaskDefinitionArn: target.taskDefinitionArn,
            reason,
            status: project_rollback_record_entity_1.RollbackStatus.STARTED,
            startedAt: new Date(),
        }));
        await this.event(projectId, record.pipelineRunId || null, deployment.id, "rollback_service_update_started", "running", "Updating ECS service to previous stable task definition.", {
            rollbackId: record.id,
            toCommitSha: target.commitSha,
            toTaskDefinitionArn: target.taskDefinitionArn,
        });
        await this.audit("ROLLBACK_SERVICE_UPDATE_STARTED", projectId, "success", {
            deploymentId: deployment.id,
            rollbackId: record.id,
            toCommitSha: target.commitSha,
            toTaskDefinitionArn: target.taskDefinitionArn,
        });
        try {
            await this.ecsService.updateServiceToTaskDefinition(projectId, target.taskDefinitionArn);
            await this.event(projectId, record.pipelineRunId || null, deployment.id, "rollback_stability_wait_started", "running", "Waiting for rollback ECS service stability.", {
                rollbackId: record.id,
            });
            const stabilityResult = await this.ecsService.waitForServiceStability(projectId, deployment.ecsServiceArn);
            if (!stabilityResult.stable) {
                throw new common_1.BadRequestException(stabilityResult.reason || "Rollback ECS service did not become stable.");
            }
            await this.event(projectId, record.pipelineRunId || null, deployment.id, "rollback_health_check_started", "running", "Waiting for rollback ALB target health.", {
                rollbackId: record.id,
            });
            const albHealthResult = await this.albService.waitForHealthyTargets(projectId);
            if (!albHealthResult.healthy) {
                throw new common_1.BadRequestException(albHealthResult.reason || "Rollback ALB targets did not become healthy.");
            }
            deployment.status = project_deployment_entity_1.ProjectDeploymentStatus.ROLLBACK_SUCCEEDED;
            deployment.commitSha = target.commitSha;
            deployment.shortCommitSha = target.shortCommitSha;
            deployment.imageUri = target.imageUri;
            deployment.taskDefinitionArn = target.taskDefinitionArn;
            deployment.rollbackCompletedAt = new Date();
            deployment.stable = true;
            deployment.errorMessage = null;
            deployment.metadata = this.safeMetadata({
                ...deployment.metadata,
                rollbackId: record.id,
                ecsStability: stabilityResult,
                albHealth: albHealthResult,
            });
            await this.deploymentRepository.save(deployment);
            record.status = project_rollback_record_entity_1.RollbackStatus.SUCCEEDED;
            record.completedAt = new Date();
            record.metadata = this.safeMetadata({ ecsStability: stabilityResult, albHealth: albHealthResult });
            await this.rollbackRepository.save(record);
            await this.releaseRepository.update({ projectId, environmentName: "dev", status: project_stable_release_entity_1.StableReleaseStatus.STABLE }, { status: project_stable_release_entity_1.StableReleaseStatus.SUPERSEDED });
            target.status = project_stable_release_entity_1.StableReleaseStatus.STABLE;
            await this.releaseRepository.save(target);
            await this.event(projectId, record.pipelineRunId || null, deployment.id, "rollback_service_stable", "success", "Rollback ECS service is stable and ALB targets are healthy.", {
                rollbackId: record.id,
                toCommitSha: target.commitSha,
            });
            await this.audit("ROLLBACK_SERVICE_STABLE", projectId, "success", {
                deploymentId: deployment.id,
                rollbackId: record.id,
                toCommitSha: target.commitSha,
            });
            return { deployment, release: target, rollback: record };
        }
        catch (error) {
            const message = this.failureMessage(error, "Rollback failed.");
            deployment.status = project_deployment_entity_1.ProjectDeploymentStatus.ROLLBACK_FAILED;
            deployment.rollbackCompletedAt = new Date();
            deployment.stable = false;
            deployment.errorMessage = message;
            await this.deploymentRepository.save(deployment);
            record.status = project_rollback_record_entity_1.RollbackStatus.FAILED;
            record.completedAt = new Date();
            record.errorMessage = message;
            await this.rollbackRepository.save(record);
            await this.event(projectId, record.pipelineRunId || null, deployment.id, "rollback_service_failed", "failed", message, {
                rollbackId: record.id,
            });
            await this.audit("ROLLBACK_SERVICE_FAILED", projectId, "failed", {
                deploymentId: deployment.id,
                rollbackId: record.id,
                reason: message,
            });
            throw error;
        }
    }
    async waitForRollbackStability(projectId, _rollbackTaskDefinitionArn) {
        return this.ecsService.waitForServiceStability(projectId);
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
            "rollbackId",
            "toCommitSha",
            "toTaskDefinitionArn",
            "reason",
            "ecsStability",
            "albHealth",
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
        const badRequest = error;
        if (badRequest.name === "BadRequestException" && badRequest.response?.message) {
            return badRequest.response.message;
        }
        return badRequest.name ? `${fallback} ${badRequest.name}` : fallback;
    }
};
exports.RollbackService = RollbackService;
exports.RollbackService = RollbackService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(project_deployment_entity_1.ProjectDeployment)),
    __param(1, (0, typeorm_1.InjectRepository)(project_stable_release_entity_1.ProjectStableRelease)),
    __param(2, (0, typeorm_1.InjectRepository)(project_rollback_record_entity_1.ProjectRollbackRecord)),
    __param(3, (0, typeorm_1.InjectRepository)(project_orchestration_event_entity_1.ProjectOrchestrationEvent)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        ecs_service_1.EcsService,
        alb_service_1.AlbService,
        audit_log_service_1.AuditLogService])
], RollbackService);
//# sourceMappingURL=rollback.service.js.map