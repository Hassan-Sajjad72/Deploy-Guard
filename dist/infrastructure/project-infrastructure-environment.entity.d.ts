import { ProjectPipelineRun } from "../projects/project-pipeline-run.entity";
import { Project } from "../projects/project.entity";
export declare enum InfrastructureEnvironmentStatus {
    NOT_PROVISIONED = "not_provisioned",
    READINESS_FAILED = "readiness_failed",
    QUEUED = "queued",
    PLANNING = "planning",
    PLAN_FAILED = "plan_failed",
    COST_CHECK_REQUIRED = "cost_check_required",
    WAITING_FOR_COST_APPROVAL = "waiting_for_cost_approval",
    PROVISIONING = "provisioning",
    PROVISIONED = "provisioned",
    FAILED = "failed",
    PARTIALLY_PROVISIONED = "partially_provisioned",
    DESTROYED = "destroyed"
}
export declare class ProjectInfrastructureEnvironment {
    id: string;
    projectId: string;
    project: Project;
    pipelineRunId: string;
    pipelineRun: ProjectPipelineRun;
    environmentName: string;
    status: string;
    awsRegion: string;
    vpcId: string;
    publicSubnetIds: string[] | null;
    privateSubnetIds: string[] | null;
    internetGatewayId: string;
    natGatewayIds: string[] | null;
    routeTableIds: Record<string, string> | null;
    albSecurityGroupId: string;
    appSecurityGroupId: string;
    internalSecurityGroupId: string;
    cloudMapNamespaceId: string;
    cloudMapNamespaceName: string;
    cloudMapServiceDiscoveryDomain: string;
    terraformWorkspacePath: string;
    terraformStateKey: string;
    terraformPlanSummary: Record<string, unknown> | null;
    terraformOutputs: Record<string, unknown> | null;
    readinessSnapshot: Record<string, unknown> | null;
    metadata: Record<string, unknown> | null;
    errorMessage: string;
    provisionedAt: Date;
    failedAt: Date;
    createdAt: Date;
    updatedAt: Date;
}
