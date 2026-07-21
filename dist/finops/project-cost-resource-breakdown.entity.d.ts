import { ProjectPipelineRun } from "../projects/project-pipeline-run.entity";
import { Project } from "../projects/project.entity";
import { ProjectCostEstimate } from "./project-cost-estimate.entity";
export declare enum CostResourceType {
    ECS_FARGATE_COMPUTE = "ecs_fargate_compute",
    LOAD_BALANCER = "load_balancer",
    DATABASE = "database",
    STORAGE = "storage",
    DATA_TRANSFER = "data_transfer",
    CLOUDWATCH_LOGS = "cloudwatch_logs",
    NAT_GATEWAY = "nat_gateway",
    OTHER = "other"
}
export declare class ProjectCostResourceBreakdown {
    id: string;
    estimateId: string;
    estimate: ProjectCostEstimate;
    projectId: string;
    project: Project;
    pipelineRunId: string;
    pipelineRun: ProjectPipelineRun;
    resourceType: string;
    resourceName: string;
    provider: string;
    serviceName: string;
    monthlyCost: number;
    hourlyCost: number;
    unit: string;
    quantity: number;
    metadata: Record<string, unknown> | null;
    createdAt: Date;
    updatedAt: Date;
}
