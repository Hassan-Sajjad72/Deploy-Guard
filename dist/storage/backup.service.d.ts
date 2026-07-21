import { Repository } from "typeorm";
import { ProjectBackupRecord } from "./project-backup-record.entity";
import { ProjectPersistentStorage } from "./project-persistent-storage.entity";
import { ProjectStorageRestoreRequest } from "./project-storage-restore-request.entity";
export declare class BackupService {
    private readonly backupRepository;
    private readonly restoreRepository;
    constructor(backupRepository: Repository<ProjectBackupRecord>, restoreRepository: Repository<ProjectStorageRestoreRequest>);
    configureBackupPlan(storage: ProjectPersistentStorage): Promise<ProjectBackupRecord>;
    getBackupStatus(projectId: string): Promise<ProjectBackupRecord[]>;
    listBackupRecoveryPoints(projectId: string): Promise<ProjectBackupRecord[]>;
    createRestoreRequest(projectId: string, persistentStorageId: string, recoveryPointArn: string | null, requestedByUserId?: number | null, reason?: string | null): Promise<ProjectStorageRestoreRequest>;
    markBackupProtected(storage: ProjectPersistentStorage): Promise<ProjectBackupRecord>;
}
