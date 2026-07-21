import { Repository } from "typeorm";
import { ProjectCostEstimate } from "../finops/project-cost-estimate.entity";
import { ProjectInfrastructureEnvironment } from "../infrastructure/project-infrastructure-environment.entity";
import { ProjectPipelineRun } from "../projects/project-pipeline-run.entity";
import { ProjectSecurityScan } from "../projects/project-security-scan.entity";
import { ProjectTerraformState } from "../state-management/project-terraform-state.entity";
import { ProjectPersistentStorage } from "../storage/project-persistent-storage.entity";
export declare class OrchestrationDeploymentReadinessService {
    private readonly costRepository;
    private readonly environmentRepository;
    private readonly scanRepository;
    private readonly stateRepository;
    private readonly storageRepository;
    constructor(costRepository: Repository<ProjectCostEstimate>, environmentRepository: Repository<ProjectInfrastructureEnvironment>, scanRepository: Repository<ProjectSecurityScan>, stateRepository: Repository<ProjectTerraformState>, storageRepository: Repository<ProjectPersistentStorage>);
    isReadyForEcsDeployment(run: ProjectPipelineRun): boolean;
    verifyEcrImageExists(run: ProjectPipelineRun): {
        passed: boolean;
        reason: string;
    };
    verifyInfrastructureProvisioned(projectId: string): Promise<{
        passed: boolean;
        reason: string;
        environment: ProjectInfrastructureEnvironment;
    }>;
    verifyCostGatePassed(projectId: string): Promise<{
        passed: boolean;
        reason: string;
        estimate: ProjectCostEstimate;
    }>;
    verifySecurityGatePassed(projectId: string, pipelineRunId?: string | null): Promise<{
        passed: boolean;
        reason: string;
        scan: ProjectSecurityScan;
    }>;
    verifyStateLockSafe(projectId: string): Promise<{
        passed: boolean;
        reason: string;
        state: ProjectTerraformState;
    }>;
    verifyEfsMountConfigIfNeeded(projectId: string): Promise<{
        passed: boolean;
        reason: string;
        storage: ProjectPersistentStorage;
    }>;
    getBlockingReasons(run: ProjectPipelineRun): Promise<string[]>;
}
