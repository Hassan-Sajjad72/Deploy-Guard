import { ConfigService } from "@nestjs/config";
import { Repository } from "typeorm";
import { ProjectInfrastructureEnvironment } from "../infrastructure/project-infrastructure-environment.entity";
import { ProjectPersistentStorage } from "./project-persistent-storage.entity";
import { BackupService } from "./backup.service";
export declare class EfsService {
    private readonly storageRepository;
    private readonly environmentRepository;
    private readonly config;
    private readonly backupService;
    constructor(storageRepository: Repository<ProjectPersistentStorage>, environmentRepository: Repository<ProjectInfrastructureEnvironment>, config: ConfigService, backupService: BackupService);
    createOrUpdateEfsConfig(projectId: string, config: {
        enabled?: boolean;
        backupEnabled?: boolean;
    }): Promise<ProjectPersistentStorage>;
    provisionEfs(projectId: string, pipelineRunId: string): Promise<ProjectPersistentStorage>;
    parseEfsTerraformOutputs(outputs: Record<string, unknown>): {
        enabled: boolean;
        efsFileSystemId: string;
        efsFileSystemArn: string;
        efsDnsName: string;
        efsAccessPointId: string;
        efsAccessPointArn: string;
        efsSecurityGroupId: string;
        kmsKeyId: string;
        kmsKeyArn: string;
        mountTargetIds: string[];
        rootDirectory: string;
        posixUid: number;
        posixGid: number;
        rootPermissions: string;
        backupVaultName: string;
        backupPlanId: string;
        backupEnabled: boolean;
    };
    saveEfsOutputs(projectId: string, pipelineRunId: string, outputs: Record<string, unknown>): Promise<ProjectPersistentStorage>;
    getEfsStatus(projectId: string): Promise<ProjectPersistentStorage>;
    getEfsMountInstructions(projectId: string): Promise<{
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
    getEfsEcsMountConfig(projectId: string): Promise<{
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
    getEfsEcsMountConfigFromStorage(storage: ProjectPersistentStorage): {
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
    private stringOutput;
}
