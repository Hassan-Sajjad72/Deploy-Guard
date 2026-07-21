import { ProjectDeployment } from "../orchestration/project-deployment.entity";
import { ProjectPipelineRun } from "../projects/project-pipeline-run.entity";
import { Project } from "../projects/project.entity";
export declare enum RuntimeMetricSource {
    PROMETHEUS = "prometheus",
    CLOUDWATCH = "cloudwatch",
    ECS = "ecs",
    ALB = "alb"
}
export declare class ProjectRuntimeMetricSnapshot {
    id: string;
    projectId: string;
    project: Project;
    deploymentId: string;
    deployment: ProjectDeployment;
    pipelineRunId: string;
    pipelineRun: ProjectPipelineRun;
    source: string;
    metricName: string;
    metricUnit: string;
    value: number;
    timestamp: Date;
    labels: Record<string, unknown> | null;
    metadata: Record<string, unknown> | null;
    createdAt: Date;
}
