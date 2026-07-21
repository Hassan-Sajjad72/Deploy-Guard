import { ConfigService } from "@nestjs/config";
import { Request } from "express";
import { Repository } from "typeorm";
import { AuditLogService } from "../audit-log/audit-log.service";
import { InfrastructureService } from "../infrastructure/infrastructure.service";
import { ProjectInfrastructureEnvironment } from "../infrastructure/project-infrastructure-environment.entity";
import { ProjectPipelineRun } from "../projects/project-pipeline-run.entity";
import { Project } from "../projects/project.entity";
import { User } from "../users/user.entity";
import { AlbService } from "./alb.service";
import { AutoscalingService } from "./autoscaling.service";
import { EcsService } from "./ecs.service";
import { ProjectDeployment } from "./project-deployment.entity";
import { ProjectOrchestrationEvent } from "./project-orchestration-event.entity";
import { ProjectStableRelease } from "./project-stable-release.entity";
import { RollbackService } from "./rollback.service";
import { SpotInterruptionService } from "./spot-interruption.service";
type RequestInfo = Request | undefined;
export declare class OrchestrationService {
    private readonly projectRepository;
    private readonly runRepository;
    private readonly environmentRepository;
    private readonly deploymentRepository;
    private readonly releaseRepository;
    private readonly eventRepository;
    private readonly infrastructureService;
    private readonly config;
    private readonly auditLogService;
    private readonly ecsService;
    private readonly albService;
    private readonly autoscalingService;
    private readonly rollbackService;
    private readonly spotInterruptionService;
    constructor(projectRepository: Repository<Project>, runRepository: Repository<ProjectPipelineRun>, environmentRepository: Repository<ProjectInfrastructureEnvironment>, deploymentRepository: Repository<ProjectDeployment>, releaseRepository: Repository<ProjectStableRelease>, eventRepository: Repository<ProjectOrchestrationEvent>, infrastructureService: InfrastructureService, config: ConfigService, auditLogService: AuditLogService, ecsService: EcsService, albService: AlbService, autoscalingService: AutoscalingService, rollbackService: RollbackService, spotInterruptionService: SpotInterruptionService);
    deploy(user: User, projectId: string, req?: RequestInfo): Promise<{
        pipelineRunId: string;
        infrastructureEnvironmentId: string;
    }>;
    getStatus(user: User, projectId: string): Promise<{
        canManage: boolean;
        deployment: ProjectDeployment;
        stableRelease: ProjectStableRelease;
        spotEvents: import("./project-spot-interruption-event.entity").ProjectSpotInterruptionEvent[];
        service: ProjectDeployment;
        targetHealth: {
            targetGroupArn: any;
            healthCheckPath: string;
            status: string;
            albDnsName: string;
            healthyCount: number;
            unhealthyCount: number;
            targetStates: any[];
        } | {
            status: string;
            healthCheckPath: string;
            albDnsName: string;
            healthy: boolean;
            reason?: string;
            targetGroupArn: string | null;
            healthyCount: number;
            unhealthyCount: number;
            targetStates: Record<string, unknown>[];
            checkedAt: string;
        };
        scaling: {
            minTasks: number;
            maxTasks: number;
            cpuTargetPercent: number;
            desiredCount: number;
            capacityProviderStrategy: Record<string, unknown>[];
            status: string;
        };
    }>;
    getEvents(user: User, projectId: string): Promise<ProjectOrchestrationEvent[]>;
    getReleases(user: User, projectId: string): Promise<ProjectStableRelease[]>;
    rollback(user: User, projectId: string, dto: {
        reason?: string;
    }, req?: RequestInfo): Promise<{
        deployment: ProjectDeployment;
        release: ProjectStableRelease;
        rollback: import("./project-rollback-record.entity").ProjectRollbackRecord;
    }>;
    getTargetHealth(user: User, projectId: string): Promise<{
        targetGroupArn: any;
        healthCheckPath: string;
        status: string;
        albDnsName: string;
        healthyCount: number;
        unhealthyCount: number;
        targetStates: any[];
    } | {
        status: string;
        healthCheckPath: string;
        albDnsName: string;
        healthy: boolean;
        reason?: string;
        targetGroupArn: string | null;
        healthyCount: number;
        unhealthyCount: number;
        targetStates: Record<string, unknown>[];
        checkedAt: string;
    }>;
    getScaling(user: User, projectId: string): Promise<{
        minTasks: number;
        maxTasks: number;
        cpuTargetPercent: number;
        desiredCount: number;
        capacityProviderStrategy: Record<string, unknown>[];
        status: string;
    }>;
    updateScaling(user: User, projectId: string, dto: {
        minTasks?: number;
        maxTasks?: number;
        cpuTargetPercent?: number;
    }, req?: RequestInfo): Promise<{
        projectId: string;
        minTasks: number;
        maxTasks: number;
        cpuTargetPercent: number;
        status: string;
    }>;
    handleSpotEvent(projectId: string, event: Record<string, unknown>, secret?: string | null): Promise<import("./project-spot-interruption-event.entity").ProjectSpotInterruptionEvent>;
    recordDeploymentFromInfrastructure(projectId: string, pipelineRunId: string, actorUser?: User | null): Promise<ProjectDeployment>;
    private attemptAutoRollback;
    event(projectId: string, pipelineRunId: string | null, deploymentId: string | null, eventType: string, status: string, message: string, actorUser?: User | null, metadata?: Record<string, unknown>): Promise<ProjectOrchestrationEvent>;
    audit(action: string, projectId: string, actorUser: User | null, status: string, metadata: Record<string, unknown>, req?: RequestInfo): Promise<void>;
    private findProjectForView;
    private findProjectForManage;
    private safeMetadata;
    private stringOutput;
}
export {};
