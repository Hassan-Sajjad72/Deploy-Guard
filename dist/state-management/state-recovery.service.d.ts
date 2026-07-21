import { Repository } from "typeorm";
import { Project } from "../projects/project.entity";
import { ProjectStateRecoveryRequest } from "./project-state-recovery-request.entity";
import { TerraformStateService } from "./terraform-state.service";
export declare class StateRecoveryService {
    private readonly projectRepository;
    private readonly recoveryRepository;
    private readonly terraformStateService;
    constructor(projectRepository: Repository<Project>, recoveryRepository: Repository<ProjectStateRecoveryRequest>, terraformStateService: TerraformStateService);
    listRecoverableVersions(projectId: string, environmentName?: string): Promise<unknown[]>;
    createRecoveryPrompt(projectId: string, versionId: string, userId?: number | null, reason?: string): Promise<ProjectStateRecoveryRequest>;
    restorePreviousVersion(projectId: string, environmentName: string, versionId: string, userId?: number | null): Promise<ProjectStateRecoveryRequest>;
    markRecoveryDecision(projectId: string, decision: "approved" | "rejected", userId?: number | null): Promise<ProjectStateRecoveryRequest>;
    recoveryRequests(projectId: string): Promise<ProjectStateRecoveryRequest[]>;
    private requireProject;
}
