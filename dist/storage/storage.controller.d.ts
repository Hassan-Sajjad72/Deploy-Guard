import { Request } from "express";
import { StorageService } from "./storage.service";
export declare class StorageController {
    private readonly storageService;
    constructor(storageService: StorageService);
    getRecommendation(req: Request, projectId: string): Promise<{
        recommendation: {
            required: boolean;
            recommended: boolean;
            enabled: boolean;
            reasons: string[];
        };
    }>;
    getStorage(req: Request, projectId: string): Promise<{
        storage: import("./project-persistent-storage.entity").ProjectPersistentStorage;
    }>;
    updateSettings(req: Request, projectId: string, dto: {
        enabled?: boolean;
        backupEnabled?: boolean;
    }): Promise<{
        storage: import("./project-persistent-storage.entity").ProjectPersistentStorage;
    }>;
    provision(req: Request, projectId: string): Promise<{
        pipelineRunId: string;
        persistentStorageId: string;
    }>;
    getEvents(req: Request, projectId: string): Promise<{
        events: import("./project-storage-event.entity").ProjectStorageEvent[];
    }>;
    getMountConfig(req: Request, projectId: string): Promise<{
        mountConfig: {
            volumes: {
                name: string;
                efsVolumeConfiguration: {
                    fileSystemId: string;
                    transitEncryption: string;
                    authorizationConfig: {
                        accessPointId: string;
                        iam: string;
                    };
                };
            }[];
            mountPoints: {
                sourceVolume: string;
                containerPath: string;
                readOnly: boolean;
            }[];
        };
    }>;
    getBackups(req: Request, projectId: string): Promise<{
        backups: import("./project-backup-record.entity").ProjectBackupRecord[];
    }>;
    createRestoreRequest(req: Request, projectId: string, dto: {
        persistentStorageId?: string;
        recoveryPointArn?: string;
        reason?: string;
    }): Promise<{
        restoreRequest: import("./project-storage-restore-request.entity").ProjectStorageRestoreRequest;
    }>;
}
