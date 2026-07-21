import { ConfigService } from "@nestjs/config";
import { Repository } from "typeorm";
import { AuditLogService } from "../audit-log/audit-log.service";
import { ProjectDeployment } from "./project-deployment.entity";
import { ProjectOrchestrationEvent } from "./project-orchestration-event.entity";
export declare class AutoscalingService {
    private readonly deploymentRepository;
    private readonly eventRepository;
    private readonly config;
    private readonly auditLogService;
    constructor(deploymentRepository: Repository<ProjectDeployment>, eventRepository: Repository<ProjectOrchestrationEvent>, config: ConfigService, auditLogService: AuditLogService);
    configureTargetTrackingCpu(projectId: string, clusterName: string, serviceName: string): Promise<{
        projectId: string;
        clusterName: string;
        serviceName: string;
        status: string;
    }>;
    updateScalingPolicy(projectId: string, minTasks: number, maxTasks: number, cpuTargetPercent: number): Promise<{
        projectId: string;
        minTasks: number;
        maxTasks: number;
        cpuTargetPercent: number;
        status: string;
    }>;
    getScalingStatus(projectId: string): Promise<{
        minTasks: number;
        maxTasks: number;
        cpuTargetPercent: number;
        desiredCount: number;
        capacityProviderStrategy: Record<string, unknown>[];
        status: string;
    }>;
    private autoscalingClient;
    private ecsClient;
    private event;
    private audit;
    private safeMetadata;
    private failureMessage;
}
