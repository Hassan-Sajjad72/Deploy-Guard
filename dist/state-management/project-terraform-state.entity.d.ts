import { ProjectInfrastructureEnvironment } from "../infrastructure/project-infrastructure-environment.entity";
import { Project } from "../projects/project.entity";
export declare enum TerraformStateStatus {
    ACTIVE = "active",
    MISSING = "missing",
    CORRUPTED = "corrupted",
    RECOVERY_REQUIRED = "recovery_required",
    RECOVERED = "recovered",
    FAILED = "failed"
}
export declare class ProjectTerraformState {
    id: string;
    projectId: string;
    project: Project;
    infrastructureEnvironmentId: string;
    infrastructureEnvironment: ProjectInfrastructureEnvironment;
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
    metadata: Record<string, unknown> | null;
    createdAt: Date;
    updatedAt: Date;
}
