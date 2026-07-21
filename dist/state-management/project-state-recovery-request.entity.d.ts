export declare enum StateRecoveryStatus {
    PENDING = "pending",
    APPROVED = "approved",
    REJECTED = "rejected",
    COMPLETED = "completed",
    FAILED = "failed"
}
export declare class ProjectStateRecoveryRequest {
    id: string;
    projectId: string;
    environmentName: string;
    corruptedVersionId: string;
    recoveryVersionId: string;
    status: string;
    requestedByUserId: number;
    approvedByUserId: number;
    reason: string;
    completedAt: Date;
    metadata: Record<string, unknown> | null;
    createdAt: Date;
    updatedAt: Date;
}
