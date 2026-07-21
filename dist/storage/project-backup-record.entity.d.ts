import { ProjectPersistentStorage } from "./project-persistent-storage.entity";
export declare enum BackupRecordStatus {
    CONFIGURED = "configured",
    BACKUP_AVAILABLE = "backup_available",
    RESTORE_REQUESTED = "restore_requested",
    RESTORE_IN_PROGRESS = "restore_in_progress",
    RESTORED = "restored",
    FAILED = "failed"
}
export declare class ProjectBackupRecord {
    id: string;
    projectId: string;
    persistentStorageId: string;
    persistentStorage: ProjectPersistentStorage;
    backupProvider: string;
    backupVaultName: string;
    backupPlanId: string;
    recoveryPointArn: string;
    status: string;
    retentionDays: number;
    schedule: string;
    metadata: Record<string, unknown> | null;
    createdAt: Date;
    updatedAt: Date;
}
