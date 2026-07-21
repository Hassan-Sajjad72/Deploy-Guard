import { StateLockService } from "./state-lock.service";
export declare class OrphanedLockMonitorService {
    private readonly lockService;
    constructor(lockService: StateLockService);
    scanActiveLocks(): Promise<import("./project-terraform-lock.entity").ProjectTerraformLock[]>;
    detectStaleHeartbeat(): Promise<import("./project-terraform-lock.entity").ProjectTerraformLock[]>;
    verifyNoActiveTerraformProcess(): Promise<boolean>;
    markDeploymentFailedForOrphanedLock(): Promise<boolean>;
    releaseOrphanedLock(lockId: string): Promise<import("./project-terraform-lock.entity").ProjectTerraformLock>;
    processNextQueuedDeployment(projectId: string): Promise<import("./project-deployment-queue-item.entity").ProjectDeploymentQueueItem>;
}
