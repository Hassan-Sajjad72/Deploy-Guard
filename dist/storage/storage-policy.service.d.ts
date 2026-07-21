import { ConfigService } from "@nestjs/config";
import { Repository } from "typeorm";
import { ProjectDetectionProfile } from "../projects/project-detection-profile.entity";
import { ProjectPersistentStorage } from "./project-persistent-storage.entity";
export declare class StoragePolicyService {
    private readonly profileRepository;
    private readonly storageRepository;
    private readonly config;
    constructor(profileRepository: Repository<ProjectDetectionProfile>, storageRepository: Repository<ProjectPersistentStorage>, config: ConfigService);
    detectPersistentStorageNeed(projectId: string): Promise<{
        required: boolean;
        reasons: string[];
        profile: ProjectDetectionProfile;
    }>;
    getPersistentStorageRecommendation(projectId: string): Promise<{
        required: boolean;
        recommended: boolean;
        enabled: boolean;
        reasons: string[];
    }>;
    shouldProvisionEfs(projectId: string): Promise<boolean>;
    buildEfsTerraformVariables(projectId: string, environmentName?: string): Promise<{
        enable_efs: boolean;
        efs_performance_mode: string;
        efs_throughput_mode: string;
        efs_transition_to_ia: string;
        efs_posix_uid: number;
        efs_posix_gid: number;
        efs_root_permissions: string;
        efs_root_directory: string;
        enable_efs_backup: boolean;
        efs_backup_retention_days: number;
        efs_backup_schedule: string;
    }>;
}
