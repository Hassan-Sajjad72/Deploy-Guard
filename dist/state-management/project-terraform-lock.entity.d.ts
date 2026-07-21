export declare enum TerraformLockStatus {
    ACQUIRED = "acquired",
    HEARTBEAT_ACTIVE = "heartbeat_active",
    QUEUED = "queued",
    RELEASED = "released",
    ORPHANED = "orphaned",
    FORCE_RELEASED = "force_released",
    FAILED = "failed"
}
export declare class ProjectTerraformLock {
    id: string;
    lockId: string;
    projectId: string;
    pipelineRunId: string;
    deploymentId: string;
    environmentName: string;
    userId: number;
    status: string;
    ownerWorkerId: string;
    terraformPid: number;
    acquiredAt: Date;
    heartbeatAt: Date;
    heartbeatIntervalSeconds: number;
    staleAfterSeconds: number;
    releasedAt: Date;
    forceReleasedAt: Date;
    metadata: Record<string, unknown> | null;
    createdAt: Date;
    updatedAt: Date;
}
