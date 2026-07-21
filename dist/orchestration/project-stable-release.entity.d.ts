import { Project } from "../projects/project.entity";
export declare enum StableReleaseStatus {
    STABLE = "stable",
    SUPERSEDED = "superseded",
    ROLLBACK_TARGET = "rollback_target",
    INVALID = "invalid"
}
export declare class ProjectStableRelease {
    id: string;
    projectId: string;
    project: Project;
    environmentName: string;
    commitSha: string;
    shortCommitSha: string;
    imageUri: string;
    taskDefinitionArn: string;
    ecsServiceArn: string;
    healthCheckPath: string;
    appPort: number;
    deployedByPipelineRunId: string;
    deployedAt: Date;
    status: string;
    metadata: Record<string, unknown> | null;
    createdAt: Date;
    updatedAt: Date;
}
