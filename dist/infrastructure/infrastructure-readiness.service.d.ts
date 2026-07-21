import { ConfigService } from "@nestjs/config";
import { Repository } from "typeorm";
import { ProjectCostEstimate } from "../finops/project-cost-estimate.entity";
import { ProjectDetectionProfile } from "../projects/project-detection-profile.entity";
import { ProjectPreflightReport } from "../projects/project-preflight-report.entity";
import { ProjectPipelineRun } from "../projects/project-pipeline-run.entity";
import { ProjectSecurityScan } from "../projects/project-security-scan.entity";
import { Project } from "../projects/project.entity";
import { User } from "../users/user.entity";
import { ProjectInfrastructureEnvironment } from "./project-infrastructure-environment.entity";
export type DeploymentReadinessCheck = {
    key: string;
    label: string;
    status: "passed" | "failed" | "missing" | "warning";
    blocking: boolean;
    message: string;
};
export declare class InfrastructureReadinessService {
    private readonly projectRepository;
    private readonly profileRepository;
    private readonly preflightRepository;
    private readonly runRepository;
    private readonly scanRepository;
    private readonly costEstimateRepository;
    private readonly environmentRepository;
    private readonly config;
    constructor(projectRepository: Repository<Project>, profileRepository: Repository<ProjectDetectionProfile>, preflightRepository: Repository<ProjectPreflightReport>, runRepository: Repository<ProjectPipelineRun>, scanRepository: Repository<ProjectSecurityScan>, costEstimateRepository: Repository<ProjectCostEstimate>, environmentRepository: Repository<ProjectInfrastructureEnvironment>, config: ConfigService);
    getDeploymentReadiness(projectId: string, user: User): Promise<{
        ready: boolean;
        checks: DeploymentReadinessCheck[];
        blockingReasons: string[];
        nextRequiredAction: string;
    }>;
    assertDeploymentReady(projectId: string, user: User): Promise<{
        ready: boolean;
        checks: DeploymentReadinessCheck[];
        blockingReasons: string[];
        nextRequiredAction: string;
    }>;
    getReadinessReasons(projectId: string, user: User): Promise<string[]>;
    private result;
    private checkBoolean;
    private costCheck;
    private hasAwsConfig;
}
