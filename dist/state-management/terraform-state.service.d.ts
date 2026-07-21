import { ConfigService } from "@nestjs/config";
import { Repository } from "typeorm";
import { ProjectInfrastructureEnvironment } from "../infrastructure/project-infrastructure-environment.entity";
import { Project } from "../projects/project.entity";
import { AwsCliService } from "./aws-cli.service";
import { ProjectTerraformState } from "./project-terraform-state.entity";
export declare class TerraformStateService {
    private readonly stateRepository;
    private readonly config;
    private readonly awsCli;
    constructor(stateRepository: Repository<ProjectTerraformState>, config: ConfigService, awsCli: AwsCliService);
    ensureStateBucket(): Promise<void>;
    ensureStateBucketVersioning(): Promise<void>;
    ensureStateBucketEncryption(): Promise<void>;
    ensureStateBucketPublicAccessBlock(): Promise<void>;
    ensureLockTable(): Promise<void>;
    buildStateKey(project: Project | {
        id: string;
        ownerUserId?: number;
    }, environmentName?: string): string;
    generateTerraformBackendConfig(project: Project, environmentName?: string): string;
    writeBackendConfig(workdir: string, project: Project, environmentName?: string): Promise<string>;
    listStateVersions(project: Project, environmentName?: string): Promise<unknown[]>;
    getStateObject(project: Project, environmentName?: string): Promise<string>;
    getPreviousStateVersion(project: Project, environmentName?: string): Promise<unknown>;
    restoreStateVersion(project: Project, environmentName: string, versionId: string): Promise<void>;
    upsertStateMetadata(input: {
        project: Project;
        environment?: ProjectInfrastructureEnvironment | null;
        environmentName?: string;
        rawState?: string | null;
        versionId?: string | null;
        resourceCount?: number | null;
        dependencyGraphHash?: string | null;
        status?: string;
    }): Promise<ProjectTerraformState>;
    getStateMetadata(projectId: string, environmentName?: string): Promise<ProjectTerraformState>;
    sha256(value: string): string;
}
