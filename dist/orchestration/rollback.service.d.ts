import { Repository } from "typeorm";
import { AuditLogService } from "../audit-log/audit-log.service";
import { AlbService } from "./alb.service";
import { EcsService } from "./ecs.service";
import { ProjectDeployment } from "./project-deployment.entity";
import { ProjectOrchestrationEvent } from "./project-orchestration-event.entity";
import { ProjectRollbackRecord } from "./project-rollback-record.entity";
import { ProjectStableRelease } from "./project-stable-release.entity";
export declare class RollbackService {
    private readonly deploymentRepository;
    private readonly releaseRepository;
    private readonly rollbackRepository;
    private readonly eventRepository;
    private readonly ecsService;
    private readonly albService;
    private readonly auditLogService;
    constructor(deploymentRepository: Repository<ProjectDeployment>, releaseRepository: Repository<ProjectStableRelease>, rollbackRepository: Repository<ProjectRollbackRecord>, eventRepository: Repository<ProjectOrchestrationEvent>, ecsService: EcsService, albService: AlbService, auditLogService: AuditLogService);
    saveStableRelease(projectId: string, pipelineRunId: string | null, commitSha: string, imageUri: string, taskDefinitionArn: string): Promise<ProjectStableRelease>;
    getPreviousStableRelease(projectId: string, excludeCommitSha?: string | null): Promise<ProjectStableRelease>;
    markDeploymentUnstable(projectId: string, pipelineRunId: string | null, reason: string): Promise<ProjectDeployment>;
    rollbackToPreviousStable(projectId: string, pipelineRunId?: string | null, reason?: string): Promise<{
        deployment: ProjectDeployment;
        release: ProjectStableRelease;
        rollback: ProjectRollbackRecord;
    }>;
    waitForRollbackStability(projectId: string, _rollbackTaskDefinitionArn: string): Promise<{
        stable: boolean;
        reason?: string;
        serviceArn: string | null;
        desiredCount: number;
        runningCount: number;
        pendingCount: number;
        rolloutState: string | null;
        deployments: Record<string, unknown>[];
        checkedAt: string;
    }>;
    private event;
    private audit;
    private safeMetadata;
    private failureMessage;
}
