"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RepositoryWorkspaceService = void 0;
const common_1 = require("@nestjs/common");
const child_process_1 = require("child_process");
const promises_1 = require("fs/promises");
const os_1 = require("os");
const path_1 = require("path");
const util_1 = require("util");
const execFileAsync = (0, util_1.promisify)(child_process_1.execFile);
let RepositoryWorkspaceService = class RepositoryWorkspaceService {
    async cloneRepository(input) {
        this.validateRepositoryUrl(input.repositoryUrl);
        const workspacePath = await (0, promises_1.mkdtemp)((0, path_1.join)((0, os_1.tmpdir)(), "deploy-guard-detect-"));
        try {
            await execFileAsync("git", [
                "clone",
                "--depth",
                "1",
                "--branch",
                input.targetBranch,
                input.repositoryUrl,
                workspacePath,
            ], { timeout: 120000, maxBuffer: 1024 * 1024 });
            const { stdout } = await execFileAsync("git", ["rev-parse", "HEAD"], {
                cwd: workspacePath,
                timeout: 10000,
            });
            return { workspacePath, commitSha: stdout.trim() || null };
        }
        catch {
            await this.cleanup(workspacePath);
            throw new common_1.BadRequestException("Unable to clone repository. Confirm the repository is public, the branch exists, and the URL is valid.");
        }
    }
    async cleanup(workspacePath) {
        await (0, promises_1.rm)(workspacePath, { recursive: true, force: true });
    }
    validateRepositoryUrl(repositoryUrl) {
        if (!/^https:\/\/github\.com\/[^/\s]+\/[^/\s]+\/?$/.test(repositoryUrl)) {
            throw new common_1.BadRequestException("repositoryUrl must be a GitHub repository URL");
        }
    }
};
exports.RepositoryWorkspaceService = RepositoryWorkspaceService;
exports.RepositoryWorkspaceService = RepositoryWorkspaceService = __decorate([
    (0, common_1.Injectable)()
], RepositoryWorkspaceService);
//# sourceMappingURL=repository-workspace.service.js.map