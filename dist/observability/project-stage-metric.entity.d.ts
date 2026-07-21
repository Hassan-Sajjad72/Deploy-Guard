import { ProjectDeployment } from "../orchestration/project-deployment.entity";
import { ProjectPipelineRun } from "../projects/project-pipeline-run.entity";
import { Project } from "../projects/project.entity";
export declare enum StageMetricStatus {
    PENDING = "pending",
    RUNNING = "running",
    SUCCEEDED = "succeeded",
    FAILED = "failed",
    SKIPPED = "skipped",
    CANCELLED = "cancelled"
}
export declare enum StageMetricSource {
    PIPELINE = "pipeline",
    GITHUB_ACTIONS = "github_actions",
    TRIVY = "trivy",
    DOCKER = "docker",
    ECR = "ecr",
    TERRAFORM = "terraform",
    FINOPS = "finops",
    ECS = "ecs",
    ALB = "alb",
    ROLLBACK = "rollback",
    MANUAL = "manual"
}
export declare class ProjectStageMetric {
    id: string;
    projectId: string;
    project: Project;
    pipelineRunId: string;
    pipelineRun: ProjectPipelineRun;
    deploymentId: string;
    deployment: ProjectDeployment;
    stageName: string;
    status: string;
    startedAt: Date;
    endedAt: Date;
    durationMs: number;
    source: string;
    metadata: Record<string, unknown> | null;
    createdAt: Date;
    updatedAt: Date;
}
