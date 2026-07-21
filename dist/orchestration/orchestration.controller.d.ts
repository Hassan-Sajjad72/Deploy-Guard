import { Request } from "express";
import { OrchestrationService } from "./orchestration.service";
export declare class OrchestrationController {
    private readonly orchestrationService;
    constructor(orchestrationService: OrchestrationService);
    deploy(req: Request, projectId: string): Promise<{
        pipelineRunId: string;
        infrastructureEnvironmentId: string;
    }>;
    status(req: Request, projectId: string): Promise<{
        canManage: boolean;
        deployment: import("./project-deployment.entity").ProjectDeployment;
        stableRelease: import("./project-stable-release.entity").ProjectStableRelease;
        spotEvents: import("./project-spot-interruption-event.entity").ProjectSpotInterruptionEvent[];
        service: import("./project-deployment.entity").ProjectDeployment;
        targetHealth: {
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
        };
        scaling: {
            minTasks: number;
            maxTasks: number;
            cpuTargetPercent: number;
            desiredCount: number;
            capacityProviderStrategy: Record<string, unknown>[];
            status: string;
        };
    }>;
    events(req: Request, projectId: string): Promise<{
        events: import("./project-orchestration-event.entity").ProjectOrchestrationEvent[];
    }>;
    releases(req: Request, projectId: string): Promise<{
        releases: import("./project-stable-release.entity").ProjectStableRelease[];
    }>;
    rollback(req: Request, projectId: string, dto: {
        reason?: string;
    }): Promise<{
        deployment: import("./project-deployment.entity").ProjectDeployment;
        release: import("./project-stable-release.entity").ProjectStableRelease;
        rollback: import("./project-rollback-record.entity").ProjectRollbackRecord;
    }>;
    targetHealth(req: Request, projectId: string): Promise<{
        targetHealth: {
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
        };
    }>;
    scaling(req: Request, projectId: string): Promise<{
        scaling: {
            minTasks: number;
            maxTasks: number;
            cpuTargetPercent: number;
            desiredCount: number;
            capacityProviderStrategy: Record<string, unknown>[];
            status: string;
        };
    }>;
    updateScaling(req: Request, projectId: string, dto: {
        minTasks?: number;
        maxTasks?: number;
        cpuTargetPercent?: number;
    }): Promise<{
        scaling: {
            projectId: string;
            minTasks: number;
            maxTasks: number;
            cpuTargetPercent: number;
            status: string;
        };
    }>;
    spotEvent(projectId: string, secret: string | undefined, event: Record<string, unknown>): Promise<{
        event: import("./project-spot-interruption-event.entity").ProjectSpotInterruptionEvent;
    }>;
}
