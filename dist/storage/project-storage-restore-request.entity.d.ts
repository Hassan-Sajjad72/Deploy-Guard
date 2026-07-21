export declare enum StorageRestoreStatus {
    PENDING = "pending",
    APPROVED = "approved",
    REJECTED = "rejected",
    RESTORING = "restoring",
    RESTORED = "restored",
    FAILED = "failed"
}
export declare class ProjectStorageRestoreRequest {
    id: string;
    projectId: string;
    persistentStorageId: string;
    recoveryPointArn: string;
    status: string;
    requestedByUserId: number;
    approvedByUserId: number;
    reason: string;
    completedAt: Date;
    metadata: Record<string, unknown> | null;
    createdAt: Date;
    updatedAt: Date;
}
