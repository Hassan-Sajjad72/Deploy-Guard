import { ProjectDeployment } from "../orchestration/project-deployment.entity";
import { ProjectPipelineRun } from "../projects/project-pipeline-run.entity";
import { Project } from "../projects/project.entity";
import { User } from "../users/user.entity";
export declare class ProjectObservabilityEvent {
    id: string;
    projectId: string;
    project: Project;
    pipelineRunId: string;
    pipelineRun: ProjectPipelineRun;
    deploymentId: string;
    deployment: ProjectDeployment;
    eventType: string;
    status: string;
    message: string;
    metadata: Record<string, unknown> | null;
    actorUserId: number;
    actorUser: User;
    createdAt: Date;
}
