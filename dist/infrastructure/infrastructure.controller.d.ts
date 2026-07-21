import { Request } from "express";
import { InfrastructureService } from "./infrastructure.service";
export declare class InfrastructureController {
    private readonly infrastructureService;
    constructor(infrastructureService: InfrastructureService);
    getDeploymentReadiness(req: Request, projectId: string): Promise<{
        ready: boolean;
        checks: import("./infrastructure-readiness.service").DeploymentReadinessCheck[];
        blockingReasons: string[];
        nextRequiredAction: string;
    }>;
    deploy(req: Request, projectId: string): Promise<{
        pipelineRunId: string;
        infrastructureEnvironmentId: string;
    }>;
    plan(req: Request, projectId: string): Promise<{
        pipelineRunId: string;
        infrastructureEnvironmentId: string;
    }>;
    apply(req: Request, projectId: string): Promise<{
        pipelineRunId: string;
        infrastructureEnvironmentId: string;
    }>;
    getInfrastructure(req: Request, projectId: string): Promise<{
        environment: {
            id: string;
            projectId: string;
            pipelineRunId: string;
            environmentName: string;
            status: string;
            awsRegion: string;
            vpcId: string;
            publicSubnetIds: string[];
            privateSubnetIds: string[];
            internetGatewayId: string;
            natGatewayIds: string[];
            routeTableIds: Record<string, string>;
            albSecurityGroupId: string;
            appSecurityGroupId: string;
            internalSecurityGroupId: string;
            cloudMapNamespaceId: string;
            cloudMapNamespaceName: string;
            cloudMapServiceDiscoveryDomain: string;
            terraformPlanSummary: Record<string, unknown>;
            errorMessage: string;
            provisionedAt: Date;
            failedAt: Date;
            createdAt: Date;
            updatedAt: Date;
        };
    }>;
    getInfrastructureEvents(req: Request, projectId: string): Promise<{
        events: import("./project-infrastructure-event.entity").ProjectInfrastructureEvent[];
    }>;
    getServiceDiscovery(req: Request, projectId: string): Promise<{
        records: import("./project-service-discovery-record.entity").ProjectServiceDiscoveryRecord[];
    }>;
}
