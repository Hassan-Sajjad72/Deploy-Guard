import { ConfigService } from "@nestjs/config";
import { Repository } from "typeorm";
import { AuditLogService } from "../audit-log/audit-log.service";
import { ProjectDeployment } from "./project-deployment.entity";
import { ProjectOrchestrationEvent } from "./project-orchestration-event.entity";
type ServiceStabilityResult = {
    stable: boolean;
    reason?: string;
    serviceArn: string | null;
    desiredCount: number;
    runningCount: number;
    pendingCount: number;
    rolloutState: string | null;
    deployments: Record<string, unknown>[];
    checkedAt: string;
};
export declare class EcsService {
    private readonly deploymentRepository;
    private readonly eventRepository;
    private readonly config;
    private readonly auditLogService;
    constructor(deploymentRepository: Repository<ProjectDeployment>, eventRepository: Repository<ProjectOrchestrationEvent>, config: ConfigService, auditLogService: AuditLogService);
    createOrUpdateCluster(projectId: string, environmentName?: string): Promise<{
        projectId: string;
        environmentName: string;
        status: string;
    }>;
    registerTaskDefinition(projectId: string, imageUri: string, deploymentProfile: Record<string, unknown>): Promise<{
        projectId: string;
        imageUri: string;
        deploymentProfile: Record<string, unknown>;
        status: string;
    }>;
    createOrUpdateService(projectId: string, taskDefinitionArn: string, infrastructureOutputs: Record<string, unknown>): Promise<{
        projectId: string;
        taskDefinitionArn: string;
        infrastructureOutputs: Record<string, unknown>;
        status: string;
    }>;
    waitForServiceStability(projectId: string, serviceArn?: string | null): Promise<ServiceStabilityResult>;
    getServiceStatus(projectId: string): Promise<ProjectDeployment>;
    forceNewDeployment(projectId: string): Promise<{
        projectId: string;
        deploymentId: string;
        status: string;
        serviceArn: string;
    }>;
    updateServiceToTaskDefinition(projectId: string, taskDefinitionArn: string): Promise<{
        projectId: string;
        taskDefinitionArn: string;
        status: string;
    }>;
    getTaskEvents(projectId: string): Promise<unknown>;
    private describeServiceStability;
    private unstableResult;
    private ecsClient;
    private event;
    private audit;
    private safeMetadata;
    private sleep;
    private failureReason;
}
export {};
