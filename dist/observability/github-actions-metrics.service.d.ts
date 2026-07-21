import { ConfigService } from "@nestjs/config";
import { Repository } from "typeorm";
import { ProjectPipelineRun } from "../projects/project-pipeline-run.entity";
import { LogSanitizerService } from "./log-sanitizer.service";
import { PipelineMetricsService } from "./pipeline-metrics.service";
type GitHubWorkflowRun = {
    id?: number | string;
    name?: string;
    head_branch?: string;
    head_sha?: string;
    status?: string;
    conclusion?: string;
    created_at?: string;
    run_started_at?: string;
    updated_at?: string;
    html_url?: string;
};
export declare class GithubActionsMetricsService {
    private readonly runRepository;
    private readonly config;
    private readonly metrics;
    private readonly sanitizer;
    constructor(runRepository: Repository<ProjectPipelineRun>, config: ConfigService, metrics: PipelineMetricsService, sanitizer: LogSanitizerService);
    fetchWorkflowRun(projectId: string, pipelineRunId: string): Promise<GitHubWorkflowRun | {
        id: string;
        name: any;
        head_branch: string;
        head_sha: string;
        status: string;
        conclusion: string;
        created_at: string;
        run_started_at: string;
        updated_at: string;
        html_url: any;
    }>;
    resolveWorkflowRunAfterDispatch(projectId: string, pipelineRunId: string): Promise<GitHubWorkflowRun | {
        id: string;
        name: any;
        head_branch: string;
        head_sha: string;
        status: string;
        conclusion: string;
        created_at: string;
        run_started_at: string;
        updated_at: string;
        html_url: any;
    }>;
    getWorkflowRunDuration(projectId: string, pipelineRunId: string): Promise<number>;
    saveGithubActionsMetric(projectId: string, pipelineRunId: string, workflowRun?: GitHubWorkflowRun | null): Promise<import("./project-stage-metric.entity").ProjectStageMetric>;
    private fallback;
    private workflowDuration;
}
export {};
