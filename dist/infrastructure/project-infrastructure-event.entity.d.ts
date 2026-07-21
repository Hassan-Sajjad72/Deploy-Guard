import { User } from "../users/user.entity";
import { ProjectInfrastructureEnvironment } from "./project-infrastructure-environment.entity";
import { ProjectPipelineRun } from "../projects/project-pipeline-run.entity";
import { Project } from "../projects/project.entity";
export declare class ProjectInfrastructureEvent {
    id: string;
    projectId: string;
    project: Project;
    pipelineRunId: string;
    pipelineRun: ProjectPipelineRun;
    infrastructureEnvironmentId: string;
    infrastructureEnvironment: ProjectInfrastructureEnvironment;
    eventType: string;
    status: string;
    message: string;
    metadata: Record<string, unknown> | null;
    actorUserId: number;
    actorUser: User;
    createdAt: Date;
}
