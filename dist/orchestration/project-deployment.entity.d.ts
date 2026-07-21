import { ProjectInfrastructureEnvironment } from "../infrastructure/project-infrastructure-environment.entity";
import { ProjectPipelineRun } from "../projects/project-pipeline-run.entity";
import { Project } from "../projects/project.entity";
export declare enum ProjectDeploymentStatus {
    QUEUED = "queued",
    DEPLOYING = "deploying",
    WAITING_FOR_SERVICE_STABILITY = "waiting_for_service_stability",
    HEALTHY = "healthy",
    UNHEALTHY = "unhealthy",
    FAILED = "failed",
    ROLLBACK_STARTED = "rollback_started",
    ROLLBACK_SUCCEEDED = "rollback_succeeded",
    ROLLBACK_FAILED = "rollback_failed",
    INTERRUPTED = "interrupted",
    SCALED = "scaled"
}
export declare class ProjectDeployment {
    id: string;
    projectId: string;
    project: Project;
    pipelineRunId: string;
    pipelineRun: ProjectPipelineRun;
    infrastructureEnvironmentId: string;
    infrastructureEnvironment: ProjectInfrastructureEnvironment;
    environmentName: string;
    status: string;
    commitSha: string;
    shortCommitSha: string;
    imageUri: string;
    taskDefinitionArn: string;
    previousTaskDefinitionArn: string;
    ecsClusterArn: string;
    ecsClusterName: string;
    ecsServiceArn: string;
    ecsServiceName: string;
    albArn: string;
    albDnsName: string;
    targetGroupArn: string;
    listenerArn: string;
    healthCheckPath: string;
    appPort: number;
    desiredCount: number;
    minTasks: number;
    maxTasks: number;
    cpuTargetPercent: number;
    capacityProviderStrategy: Record<string, unknown>[] | null;
    efsMountConfig: Record<string, unknown> | null;
    cloudMapNamespaceId: string;
    cloudMapServiceName: string;
    deploymentStartedAt: Date;
    deploymentCompletedAt: Date;
    failedAt: Date;
    rollbackStartedAt: Date;
    rollbackCompletedAt: Date;
    stable: boolean;
    metadata: Record<string, unknown> | null;
    errorMessage: string;
    createdAt: Date;
    updatedAt: Date;
}
