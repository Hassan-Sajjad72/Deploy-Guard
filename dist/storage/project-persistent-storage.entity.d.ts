import { ProjectInfrastructureEnvironment } from "../infrastructure/project-infrastructure-environment.entity";
import { ProjectPipelineRun } from "../projects/project-pipeline-run.entity";
import { Project } from "../projects/project.entity";
export declare enum PersistentStorageStatus {
    NOT_REQUIRED = "not_required",
    RECOMMENDED = "recommended",
    PENDING = "pending",
    PROVISIONING = "provisioning",
    PROVISIONED = "provisioned",
    FAILED = "failed",
    BACKUP_CONFIGURED = "backup_configured",
    RESTORE_PENDING = "restore_pending",
    RESTORED = "restored"
}
export declare enum PersistentStorageType {
    EFS = "efs"
}
export declare class ProjectPersistentStorage {
    id: string;
    projectId: string;
    project: Project;
    infrastructureEnvironmentId: string;
    infrastructureEnvironment: ProjectInfrastructureEnvironment;
    pipelineRunId: string;
    pipelineRun: ProjectPipelineRun;
    environmentName: string;
    enabled: boolean;
    requiredByDetection: boolean;
    userEnabled: boolean;
    status: string;
    storageType: string;
    awsRegion: string;
    efsFileSystemId: string;
    efsFileSystemArn: string;
    efsDnsName: string;
    efsAccessPointId: string;
    efsAccessPointArn: string;
    efsSecurityGroupId: string;
    kmsKeyId: string;
    kmsKeyArn: string;
    mountTargetIds: string[] | null;
    rootDirectory: string;
    posixUid: number;
    posixGid: number;
    rootPermissions: string;
    encrypted: boolean;
    backupEnabled: boolean;
    backupVaultName: string;
    backupPlanId: string;
    backupRetentionDays: number;
    ecsMountConfig: Record<string, unknown> | null;
    metadata: Record<string, unknown> | null;
    errorMessage: string;
    provisionedAt: Date;
    failedAt: Date;
    createdAt: Date;
    updatedAt: Date;
}
