import { Project } from "./project.entity";
import { ProjectPipelineRun } from "./project-pipeline-run.entity";
export declare class ProjectPipelineEvent {
    id: string;
    pipelineRunId: string;
    pipelineRun: ProjectPipelineRun;
    projectId: string;
    project: Project;
    stage: string;
    status: string;
    message: string;
    metadata: Record<string, unknown> | null;
    createdAt: Date;
}
