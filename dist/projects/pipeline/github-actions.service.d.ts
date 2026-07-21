import { ConfigService } from "@nestjs/config";
export declare class GithubActionsService {
    private readonly config;
    constructor(config: ConfigService);
    getWorkflowFile(): string;
    triggerWorkflow(input: {
        repositoryFullName: string;
        targetBranch: string;
    }): Promise<{
        status: string;
        workflowRunId: string | null;
    }>;
    private dispatchErrorMessage;
}
