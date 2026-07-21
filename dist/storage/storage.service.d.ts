import { Queue } from "bullmq";
import { Request } from "express";
import { Repository } from "typeorm";
import { AuditLogService } from "../audit-log/audit-log.service";
import { ProjectPipelineRun } from "../projects/project-pipeline-run.entity";
import { PipelineJobData } from "../projects/pipeline/pipeline.types";
import { Project } from "../projects/project.entity";
import { User } from "../users/user.entity";
import { BackupService } from "./backup.service";
import { EfsService } from "./efs.service";
import { ProjectPersistentStorage } from "./project-persistent-storage.entity";
import { ProjectStorageEvent } from "./project-storage-event.entity";
import { StoragePolicyService } from "./storage-policy.service";
type RequestInfo = Request | undefined;
export declare class StorageService {
    private readonly projectRepository;
    private readonly runRepository;
    private readonly storageRepository;
    private readonly eventRepository;
    private readonly pipelineQueue;
    private readonly auditLogService;
    private readonly policyService;
    private readonly efsService;
    private readonly backupService;
    constructor(projectRepository: Repository<Project>, runRepository: Repository<ProjectPipelineRun>, storageRepository: Repository<ProjectPersistentStorage>, eventRepository: Repository<ProjectStorageEvent>, pipelineQueue: Queue<PipelineJobData>, auditLogService: AuditLogService, policyService: StoragePolicyService, efsService: EfsService, backupService: BackupService);
    getRecommendation(user: User, projectId: string): Promise<{
        required: boolean;
        recommended: boolean;
        enabled: boolean;
        reasons: string[];
    }>;
    getStorage(user: User, projectId: string): Promise<ProjectPersistentStorage>;
    updateSettings(user: User, projectId: string, dto: {
        enabled?: boolean;
        backupEnabled?: boolean;
    }, req?: RequestInfo): Promise<ProjectPersistentStorage>;
    provision(user: User, projectId: string, req?: RequestInfo): Promise<{
        pipelineRunId: string;
        persistentStorageId: string;
    }>;
    getEvents(user: User, projectId: string): Promise<ProjectStorageEvent[]>;
    getMountConfig(user: User, projectId: string): Promise<{
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
    }>;
    getBackups(user: User, projectId: string): Promise<import("./project-backup-record.entity").ProjectBackupRecord[]>;
    createRestoreRequest(user: User, projectId: string, dto: {
        persistentStorageId?: string;
        recoveryPointArn?: string;
        reason?: string;
    }, req?: RequestInfo): Promise<import("./project-storage-restore-request.entity").ProjectStorageRestoreRequest>;
    recordStorageEvent(projectId: string, pipelineRunId: string | null, eventType: string, status: string, message: string, actorUser?: User | null, metadata?: Record<string, unknown>): Promise<ProjectStorageEvent>;
    private event;
    private audit;
    private findProjectForView;
    private findProjectForManage;
    private safeMetadata;
}
export {};
