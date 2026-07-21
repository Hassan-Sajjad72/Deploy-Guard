import { ConfigService } from "@nestjs/config";
import { Repository } from "typeorm";
import { ProjectStateValidationResult } from "./project-state-validation-result.entity";
import { ProjectTerraformState } from "./project-terraform-state.entity";
import { TerraformStateService } from "./terraform-state.service";
export declare class StateCorruptionService {
    private readonly resultRepository;
    private readonly stateRepository;
    private readonly config;
    private readonly terraformStateService;
    constructor(resultRepository: Repository<ProjectStateValidationResult>, stateRepository: Repository<ProjectTerraformState>, config: ConfigService, terraformStateService: TerraformStateService);
    validateTerraformStateJson(stateJson: string): boolean;
    validateChecksum(stateJson: string, expectedChecksum?: string | null): boolean;
    validateResourceCountConsistency(resourceCount: number, previousResourceCount?: number | null): boolean;
    validateDependencyGraph(stateJson: string): boolean;
    detectCorruption(projectId: string, environmentName?: string, rawState?: string | null): Promise<ProjectStateValidationResult>;
    validationResults(projectId: string, environmentName?: string): Promise<ProjectStateValidationResult[]>;
    dependencyGraphHash(stateJson: string): string;
    private safeParse;
    private sha256;
}
