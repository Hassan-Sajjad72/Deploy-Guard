export declare enum DeploymentQueueStatus {
    QUEUED = "queued",
    WAITING_FOR_LOCK = "waiting_for_lock",
    PROCESSING = "processing",
    COMPLETED = "completed",
    FAILED = "failed",
    CANCELLED = "cancelled"
}
export declare class ProjectDeploymentQueueItem {
    id: string;
    projectId: string;
    pipelineRunId: string;
    environmentName: string;
    status: string;
    position: number;
    reason: string;
    startedAt: Date;
    completedAt: Date;
    failedAt: Date;
    metadata: Record<string, unknown> | null;
    createdAt: Date;
    updatedAt: Date;
}
