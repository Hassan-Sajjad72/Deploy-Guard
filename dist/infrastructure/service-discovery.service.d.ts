import { Repository } from "typeorm";
import { ProjectServiceDiscoveryRecord } from "./project-service-discovery-record.entity";
export declare class ServiceDiscoveryService {
    private readonly recordRepository;
    constructor(recordRepository: Repository<ProjectServiceDiscoveryRecord>);
    mapCloudMapOutputs(outputs: Record<string, unknown>): {
        namespaceId: string;
        namespaceName: string;
        dnsName: string;
        cloudMapServiceId: string;
    };
    buildInternalDnsName(serviceName: string, namespaceName: string): string;
    saveServiceDiscoveryRecord(projectId: string, infrastructureEnvironmentId: string, serviceName: string, outputs: Record<string, unknown>): Promise<ProjectServiceDiscoveryRecord>;
}
