import { ConfigService } from "@nestjs/config";
import { Repository } from "typeorm";
import { ProjectDeploymentQueueItem } from "./project-deployment-queue-item.entity";
import { ProjectTerraformLock } from "./project-terraform-lock.entity";
export declare class StateLockService {
    private readonly lockRepository;
    private readonly queueRepository;
    private readonly config;
    private readonly ownerWorkerId;
    constructor(lockRepository: Repository<ProjectTerraformLock>, queueRepository: Repository<ProjectDeploymentQueueItem>, config: ConfigService);
    buildLockId(projectId: string, environmentName?: string): string;
    acquireLock(projectId: string, pipelineRunId: string, userId: number | null, environmentName?: string, metadata?: Record<string, unknown>): Promise<{
        acquired: boolean;
        lock: ProjectTerraformLock;
    }>;
    releaseLock(lockId: string, pipelineRunId: string): Promise<ProjectTerraformLock>;
    getLock(lockId: string): Promise<ProjectTerraformLock>;
    markLockOrphaned(lockId: string): Promise<ProjectTerraformLock>;
    forceReleaseOrphanedLock(lockId: string): Promise<ProjectTerraformLock>;
    enqueueBehindExistingLock(projectId: string, pipelineRunId: string, environmentName?: string): Promise<ProjectDeploymentQueueItem>;
    getQueuedDeployments(projectId: string, environmentName?: string): Promise<ProjectDeploymentQueueItem[]>;
    processNextQueuedDeployment(projectId: string, environmentName?: string): Promise<ProjectDeploymentQueueItem>;
    activeLocks(): Promise<ProjectTerraformLock[]>;
    isStale(lock: ProjectTerraformLock): boolean;
}
