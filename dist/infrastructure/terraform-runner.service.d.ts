import { ConfigService } from "@nestjs/config";
export type TerraformRunResult = {
    stdout: string;
    stderr: string;
};
export declare class TerraformRunnerService {
    private readonly config;
    constructor(config: ConfigService);
    runTerraformInit(workdir: string, env?: NodeJS.ProcessEnv, backendConfigPath?: string | null): Promise<{
        stdout: string;
        stderr: string;
    }>;
    runTerraformValidate(workdir: string, env?: NodeJS.ProcessEnv): Promise<{
        stdout: string;
        stderr: string;
    }>;
    runTerraformPlan(workdir: string, env?: NodeJS.ProcessEnv): Promise<{
        stdout: string;
        stderr: string;
    }>;
    runTerraformShowJson(workdir: string, env?: NodeJS.ProcessEnv): Promise<{
        stdout: string;
        stderr: string;
    }>;
    runTerraformApply(workdir: string, env?: NodeJS.ProcessEnv): Promise<{
        stdout: string;
        stderr: string;
    }>;
    parseOutputs(workdir: string, env?: NodeJS.ProcessEnv): Promise<Record<string, unknown>>;
    sanitizeTerraformLogs(logs: string): string;
    private run;
}
