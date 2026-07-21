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
Object.defineProperty(exports, "__esModule", { value: true });
exports.GithubActionsService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
let GithubActionsService = class GithubActionsService {
    constructor(config) {
        this.config = config;
    }
    getWorkflowFile() {
        return this.config.get("GITHUB_ACTIONS_WORKFLOW_FILE", "deploy.yml");
    }
    async triggerWorkflow(input) {
        const token = this.config.get("GITHUB_TOKEN");
        const workflowFile = this.config.get("GITHUB_ACTIONS_WORKFLOW_FILE", "deploy.yml");
        if (!token || !workflowFile) {
            throw new Error("GitHub Actions token is not configured.");
        }
        let response;
        try {
            response = await fetch(`https://api.github.com/repos/${input.repositoryFullName}/actions/workflows/${encodeURIComponent(workflowFile)}/dispatches`, {
                method: "POST",
                headers: {
                    Accept: "application/vnd.github+json",
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                    "User-Agent": "Deploy-Guard",
                },
                body: JSON.stringify({ ref: input.targetBranch }),
            });
        }
        catch {
            throw new Error("GitHub Actions workflow dispatch failed.");
        }
        if (!response.ok) {
            throw new Error(this.dispatchErrorMessage(response.status, workflowFile));
        }
        return { status: "dispatched", workflowRunId: null };
    }
    dispatchErrorMessage(status, workflowFile) {
        if (status === 401) {
            return "GitHub Actions token is not configured.";
        }
        if (status === 403) {
            return "GitHub Actions workflow dispatch failed due to insufficient token permissions.";
        }
        if (status === 404) {
            return `GitHub Actions workflow ${workflowFile} was not found in the selected repository branch.`;
        }
        if (status === 422) {
            return "GitHub Actions workflow dispatch failed because the selected branch is invalid or the workflow is not dispatchable.";
        }
        if (status === 429) {
            return "GitHub Actions workflow dispatch failed because the GitHub rate limit was reached.";
        }
        return "GitHub Actions workflow dispatch failed.";
    }
};
exports.GithubActionsService = GithubActionsService;
exports.GithubActionsService = GithubActionsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], GithubActionsService);
//# sourceMappingURL=github-actions.service.js.map