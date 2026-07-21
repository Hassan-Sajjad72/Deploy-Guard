import { ConfigService } from "@nestjs/config";
import { Project } from "../projects/project.entity";
export declare class TerraformCostPlanService {
    private readonly config;
    constructor(config: ConfigService);
    getTerraformWorkingDirectory(project: Project): string;
    ensureConfigured(project: Project): string;
    generateTerraformPlan(project: Project): Promise<{
        workdir: string;
        planPath: string;
    }>;
    convertTerraformPlanToJson(planPath: string, workdir: string): Promise<string>;
    private run;
}
