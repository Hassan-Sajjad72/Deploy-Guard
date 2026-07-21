import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class GithubActionsService {
  constructor(private readonly config: ConfigService) {}

  getWorkflowFile() {
    return this.config.get<string>("GITHUB_ACTIONS_WORKFLOW_FILE", "deploy.yml");
  }

  async triggerWorkflow(input: {
    repositoryFullName: string;
    targetBranch: string;
  }): Promise<{ status: string; workflowRunId: string | null }> {
    const token = this.config.get<string>("GITHUB_TOKEN");
    const workflowFile = this.config.get<string>(
      "GITHUB_ACTIONS_WORKFLOW_FILE",
      "deploy.yml"
    );

    if (!token || !workflowFile) {
      throw new Error("GitHub Actions token is not configured.");
    }

    let response: Response;

    try {
      response = await fetch(
        `https://api.github.com/repos/${input.repositoryFullName}/actions/workflows/${encodeURIComponent(
          workflowFile
        )}/dispatches`,
        {
          method: "POST",
          headers: {
            Accept: "application/vnd.github+json",
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            "User-Agent": "Deploy-Guard",
          },
          body: JSON.stringify({ ref: input.targetBranch }),
        }
      );
    } catch {
      throw new Error("GitHub Actions workflow dispatch failed.");
    }

    if (!response.ok) {
      throw new Error(this.dispatchErrorMessage(response.status, workflowFile));
    }

    return { status: "dispatched", workflowRunId: null };
  }

  private dispatchErrorMessage(status: number, workflowFile: string) {
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
}
