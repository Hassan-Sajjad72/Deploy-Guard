export declare enum SpotInterruptionStatus {
    RECEIVED = "received",
    REPLACEMENT_TRIGGERED = "replacement_triggered",
    HANDLED = "handled",
    FAILED = "failed"
}
export declare class ProjectSpotInterruptionEvent {
    id: string;
    projectId: string;
    deploymentId: string;
    pipelineRunId: string;
    ecsClusterArn: string;
    ecsServiceArn: string;
    taskArn: string;
    eventId: string;
    eventTime: Date;
    reason: string;
    status: string;
    metadata: Record<string, unknown> | null;
    createdAt: Date;
    updatedAt: Date;
}
