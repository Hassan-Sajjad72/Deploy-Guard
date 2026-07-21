import { ProjectPipelineRun } from "../projects/project-pipeline-run.entity";
import { Project } from "../projects/project.entity";
import { User } from "../users/user.entity";
export declare class ProjectDeploymentReadinessSnapshot {
    id: string;
    projectId: string;
    project: Project;
    pipelineRunId: string;
    pipelineRun: ProjectPipelineRun;
    ready: boolean;
    checks: Record<string, unknown>[];
    blockingReasons: string[];
    createdByUserId: number;
    createdByUser: User;
    createdAt: Date;
}
