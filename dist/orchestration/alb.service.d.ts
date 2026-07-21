import { ConfigService } from "@nestjs/config";
import { Repository } from "typeorm";
import { AuditLogService } from "../audit-log/audit-log.service";
import { ProjectDeployment } from "./project-deployment.entity";
import { ProjectOrchestrationEvent } from "./project-orchestration-event.entity";
type AlbHealthResult = {
    healthy: boolean;
    reason?: string;
    targetGroupArn: string | null;
    healthyCount: number;
    unhealthyCount: number;
    targetStates: Record<string, unknown>[];
    checkedAt: string;
};
export declare class AlbService {
    private readonly deploymentRepository;
    private readonly eventRepository;
    private readonly config;
    private readonly auditLogService;
    constructor(deploymentRepository: Repository<ProjectDeployment>, eventRepository: Repository<ProjectOrchestrationEvent>, config: ConfigService, auditLogService: AuditLogService);
    createOrUpdateAlb(projectId: string, infrastructureOutputs: Record<string, unknown>): Promise<{
        projectId: string;
        albArn: unknown;
    }>;
    createOrUpdateTargetGroup(projectId: string, healthCheckPath: string, appPort: number): Promise<{
        projectId: string;
        healthCheckPath: string;
        appPort: number;
        status: string;
    }>;
    createOrUpdateListener(projectId: string): Promise<{
        projectId: string;
        status: string;
    }>;
    getTargetHealth(projectId: string): Promise<{
        targetGroupArn: any;
        healthCheckPath: string;
        status: string;
        albDnsName: string;
        healthyCount: number;
        unhealthyCount: number;
        targetStates: any[];
    } | {
        status: string;
        healthCheckPath: string;
        albDnsName: string;
        healthy: boolean;
        reason?: string;
        targetGroupArn: string | null;
        healthyCount: number;
        unhealthyCount: number;
        targetStates: Record<string, unknown>[];
        checkedAt: string;
    }>;
    waitForHealthyTargets(projectId: string): Promise<AlbHealthResult>;
    private describeTargetHealth;
    private unhealthyResult;
    private elbClient;
    private event;
    private audit;
    private safeMetadata;
    private sleep;
    private failureReason;
}
export {};
