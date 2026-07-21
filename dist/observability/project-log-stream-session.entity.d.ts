import { ProjectDeployment } from "../orchestration/project-deployment.entity";
import { ProjectPipelineRun } from "../projects/project-pipeline-run.entity";
import { Project } from "../projects/project.entity";
import { User } from "../users/user.entity";
export declare enum LogStreamSessionStatus {
    STARTED = "started",
    ACTIVE = "active",
    STOPPED = "stopped",
    FAILED = "failed"
}
export declare enum LogStreamSessionSource {
    CLOUDWATCH_LOGS = "cloudwatch_logs",
    MOCK = "mock"
}
export declare class ProjectLogStreamSession {
    id: string;
    projectId: string;
    project: Project;
    pipelineRunId: string;
    pipelineRun: ProjectPipelineRun;
    deploymentId: string;
    deployment: ProjectDeployment;
    userId: number;
    user: User;
    status: string;
    source: string;
    logGroupName: string;
    logStreamName: string;
    startedAt: Date;
    stoppedAt: Date;
    errorMessage: string;
    metadata: Record<string, unknown> | null;
    createdAt: Date;
    updatedAt: Date;
}
