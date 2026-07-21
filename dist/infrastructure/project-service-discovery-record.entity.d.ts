import { Project } from "../projects/project.entity";
import { ProjectInfrastructureEnvironment } from "./project-infrastructure-environment.entity";
export declare class ProjectServiceDiscoveryRecord {
    id: string;
    projectId: string;
    project: Project;
    infrastructureEnvironmentId: string;
    infrastructureEnvironment: ProjectInfrastructureEnvironment;
    serviceName: string;
    namespaceId: string;
    namespaceName: string;
    dnsName: string;
    cloudMapServiceId: string;
    status: string;
    metadata: Record<string, unknown> | null;
    createdAt: Date;
    updatedAt: Date;
}
