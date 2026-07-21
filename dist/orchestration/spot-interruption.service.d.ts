import { ConfigService } from "@nestjs/config";
import { Repository } from "typeorm";
import { AuditLogService } from "../audit-log/audit-log.service";
import { EcsService } from "./ecs.service";
import { ProjectDeployment } from "./project-deployment.entity";
import { ProjectOrchestrationEvent } from "./project-orchestration-event.entity";
import { ProjectSpotInterruptionEvent } from "./project-spot-interruption-event.entity";
export declare class SpotInterruptionService {
    private readonly deploymentRepository;
    private readonly eventRepository;
    private readonly spotRepository;
    private readonly config;
    private readonly auditLogService;
    private readonly ecsService;
    constructor(deploymentRepository: Repository<ProjectDeployment>, eventRepository: Repository<ProjectOrchestrationEvent>, spotRepository: Repository<ProjectSpotInterruptionEvent>, config: ConfigService, auditLogService: AuditLogService, ecsService: EcsService);
    configureEventBridgeRule(projectId: string): Promise<{
        projectId: string;
        status: string;
    }>;
    handleSpotInterruptionEvent(projectId: string, event: Record<string, unknown>, secret?: string | null): Promise<ProjectSpotInterruptionEvent>;
    recordSpotInterruption(projectId: string, taskArn: string | null, reason: string, options?: {
        eventId?: string | null;
        eventTime?: Date | null;
        deployment?: ProjectDeployment | null;
        detailType?: string | null;
    }): Promise<ProjectSpotInterruptionEvent>;
    triggerReplacementTaskOrForceDeployment(projectId: string): Promise<{
        projectId: string;
        deploymentId: string;
        status: string;
    }>;
    list(projectId: string): Promise<ProjectSpotInterruptionEvent[]>;
    private safeMetadata;
    private findRecentHandledEvent;
    private failureMessage;
}
