import { ConfigService } from "@nestjs/config";
import { ProjectPipelineRun } from "../project-pipeline-run.entity";
import { Project } from "../project.entity";
export type TerraformPlanResult = {
    terraformConfigured: boolean;
    terraformStatus: "skipped_not_configured" | "completed" | "failed";
    terraformWorkingDirectory?: string;
    reason?: string;
};
export declare class TerraformService {
    private readonly config;
    constructor(config: ConfigService);
    prepareTerraformJob(project: Project, pipelineRun: ProjectPipelineRun): {
        projectId: string;
        pipelineRunId: string;
        terraformConfigured: boolean;
        terraformWorkingDirectory: string;
    };
    isTerraformConfigured(project: Project): boolean;
    getTerraformWorkingDirectory(project: Project): string;
    runTerraformPlan(project: Project, pipelineRun: ProjectPipelineRun): Promise<TerraformPlanResult>;
    runTerraformPlanPlaceholder(project: Project, _pipelineRun: ProjectPipelineRun): Promise<TerraformPlanResult>;
}
