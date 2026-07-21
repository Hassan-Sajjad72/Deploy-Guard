"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GithubActionsMetricsService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const project_pipeline_run_entity_1 = require("../projects/project-pipeline-run.entity");
const log_sanitizer_service_1 = require("./log-sanitizer.service");
const pipeline_metrics_service_1 = require("./pipeline-metrics.service");
const project_stage_metric_entity_1 = require("./project-stage-metric.entity");
let GithubActionsMetricsService = class GithubActionsMetricsService {
    constructor(runRepository, config, metrics, sanitizer) {
        this.runRepository = runRepository;
        this.config = config;
        this.metrics = metrics;
        this.sanitizer = sanitizer;
    }
    async fetchWorkflowRun(projectId, pipelineRunId) {
        const run = await this.runRepository.findOne({ where: { id: pipelineRunId, projectId } });
        if (!run?.githubWorkflowRunId || !run.repositoryFullName || !this.config.get("GITHUB_TOKEN")) {
            return this.fallback(run);
        }
        const response = await fetch(`https://api.github.com/repos/${run.repositoryFullName}/actions/runs/${run.githubWorkflowRunId}`, {
            headers: {
                Accept: "application/vnd.github+json",
                Authorization: `Bearer ${this.config.get("GITHUB_TOKEN")}`,
                "User-Agent": "Deploy-Guard",
            },
        });
        if (!response.ok) {
            return this.fallback(run, `github_api_${response.status}`);
        }
        return response.json();
    }
    async resolveWorkflowRunAfterDispatch(projectId, pipelineRunId) {
        return this.fetchWorkflowRun(projectId, pipelineRunId);
    }
    async getWorkflowRunDuration(projectId, pipelineRunId) {
        const workflowRun = await this.fetchWorkflowRun(projectId, pipelineRunId);
        return this.workflowDuration(workflowRun);
    }
    async saveGithubActionsMetric(projectId, pipelineRunId, workflowRun) {
        const run = await this.runRepository.findOne({ where: { id: pipelineRunId, projectId } });
        const workflow = workflowRun || await this.fetchWorkflowRun(projectId, pipelineRunId);
        const durationMs = this.workflowDuration(workflow);
        const status = workflow?.conclusion === "failure" || workflow?.conclusion === "cancelled" ? "failed" : "succeeded";
        await this.metrics.startStage(projectId, pipelineRunId, "github_actions", project_stage_metric_entity_1.StageMetricSource.GITHUB_ACTIONS, {
            workflowRunId: workflow?.id || run?.githubWorkflowRunId || null,
            workflowName: workflow?.name || null,
            branch: workflow?.head_branch || run?.targetBranch || null,
            commitSha: workflow?.head_sha || run?.commitSha || null,
            status: workflow?.status || run?.githubWorkflowStatus || "unknown",
            htmlUrl: workflow?.html_url || null,
        });
        return this.metrics.completeStage(projectId, pipelineRunId, "github_actions", {
            workflowRunId: workflow?.id || run?.githubWorkflowRunId || null,
            workflowName: workflow?.name || null,
            branch: workflow?.head_branch || run?.targetBranch || null,
            commitSha: workflow?.head_sha || run?.commitSha || null,
            status,
            durationMs,
            htmlUrl: workflow?.html_url || null,
        });
    }
    fallback(run, reason = "workflow_run_unresolved") {
        return {
            id: run?.githubWorkflowRunId || null,
            name: null,
            head_branch: run?.targetBranch || null,
            head_sha: run?.commitSha || null,
            status: run?.githubWorkflowStatus || "dispatched",
            conclusion: reason,
            created_at: run?.startedAt?.toISOString() || run?.createdAt?.toISOString(),
            run_started_at: run?.startedAt?.toISOString() || run?.createdAt?.toISOString(),
            updated_at: run?.completedAt?.toISOString() || run?.updatedAt?.toISOString(),
            html_url: null,
        };
    }
    workflowDuration(workflowRun) {
        const startedAt = workflowRun?.run_started_at || workflowRun?.created_at;
        const completedAt = workflowRun?.updated_at;
        if (!startedAt || !completedAt) {
            return null;
        }
        return Math.max(0, new Date(completedAt).getTime() - new Date(startedAt).getTime());
    }
};
exports.GithubActionsMetricsService = GithubActionsMetricsService;
exports.GithubActionsMetricsService = GithubActionsMetricsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(project_pipeline_run_entity_1.ProjectPipelineRun)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        config_1.ConfigService,
        pipeline_metrics_service_1.PipelineMetricsService,
        log_sanitizer_service_1.LogSanitizerService])
], GithubActionsMetricsService);
//# sourceMappingURL=github-actions-metrics.service.js.map