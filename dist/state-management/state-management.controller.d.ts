import { Request } from "express";
import { StateManagementService } from "./state-management.service";
export declare class StateManagementController {
    private readonly stateManagementService;
    constructor(stateManagementService: StateManagementService);
    getState(req: Request, projectId: string): Promise<{
        state: {
            id: string;
            projectId: string;
            environmentName: string;
            stateBucket: string;
            stateKey: string;
            stateRegion: string;
            currentVersionId: string;
            previousVersionId: string;
            checksum: string;
            resourceCount: number;
            dependencyGraphHash: string;
            status: string;
            lastValidatedAt: Date;
            createdAt: Date;
            updatedAt: Date;
        };
    }>;
    getVersions(req: Request, projectId: string): Promise<{
        versions: unknown[];
    }>;
    getLocks(req: Request, projectId: string): Promise<{
        lock: import("./project-terraform-lock.entity").ProjectTerraformLock;
        queue: import("./project-deployment-queue-item.entity").ProjectDeploymentQueueItem[];
    }>;
    getValidation(req: Request, projectId: string): Promise<{
        results: import("./project-state-validation-result.entity").ProjectStateValidationResult[];
    }>;
    validate(req: Request, projectId: string): Promise<{
        result: import("./project-state-validation-result.entity").ProjectStateValidationResult;
    }>;
    recover(req: Request, projectId: string, dto: Record<string, unknown>): Promise<{
        recovery: import("./project-state-recovery-request.entity").ProjectStateRecoveryRequest;
    }>;
    forceRelease(req: Request, projectId: string, lockId: string): Promise<{
        lock: import("./project-terraform-lock.entity").ProjectTerraformLock;
    }>;
}
