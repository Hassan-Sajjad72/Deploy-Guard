import { ProjectPipelineRun } from "../projects/project-pipeline-run.entity";
import { Project } from "../projects/project.entity";
export declare class ProjectPipelineMetricSummary {
    id: string;
    projectId: string;
    project: Project;
    pipelineRunId: string;
    pipelineRun: ProjectPipelineRun;
    totalDurationMs: number;
    githubActionsDurationMs: number;
    dockerBuildDurationMs: number;
    trivyScanDurationMs: number;
    ecrPushDurationMs: number;
    terraformPlanDurationMs: number;
    terraformApplyDurationMs: number;
    finopsDurationMs: number;
    ecsDeploymentDurationMs: number;
    albHealthCheckDurationMs: number;
    rollbackDurationMs: number;
    status: string;
    metadata: Record<string, unknown> | null;
    createdAt: Date;
    updatedAt: Date;
}
