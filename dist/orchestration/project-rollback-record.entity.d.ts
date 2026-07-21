export declare enum RollbackStatus {
    STARTED = "started",
    SUCCEEDED = "succeeded",
    FAILED = "failed"
}
export declare class ProjectRollbackRecord {
    id: string;
    projectId: string;
    deploymentId: string;
    pipelineRunId: string;
    fromCommitSha: string;
    toCommitSha: string;
    fromTaskDefinitionArn: string;
    toTaskDefinitionArn: string;
    reason: string;
    status: string;
    startedAt: Date;
    completedAt: Date;
    metadata: Record<string, unknown> | null;
    errorMessage: string;
    createdAt: Date;
}
