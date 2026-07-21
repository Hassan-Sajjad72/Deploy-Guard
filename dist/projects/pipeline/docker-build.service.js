"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DockerBuildService = void 0;
const common_1 = require("@nestjs/common");
const child_process_1 = require("child_process");
const util_1 = require("util");
const execFileAsync = (0, util_1.promisify)(child_process_1.execFile);
let DockerBuildService = class DockerBuildService {
    async isDockerAvailable() {
        try {
            await execFileAsync("docker", ["version", "--format", "{{.Server.Version}}"], {
                timeout: 15000,
            });
            return true;
        }
        catch {
            return false;
        }
    }
    async buildImage(input) {
        await execFileAsync("docker", ["build", "-t", `${input.imageName}:${input.imageTag}`, input.workspacePath], {
            timeout: 10 * 60 * 1000,
            maxBuffer: 8 * 1024 * 1024,
        });
    }
    async tagImage(input) {
        await execFileAsync("docker", ["tag", `${input.localImageName}:${input.imageTag}`, input.ecrImageUri], {
            timeout: 60000,
            maxBuffer: 1024 * 1024,
        });
    }
    async pushImage(ecrImageUri) {
        await execFileAsync("docker", ["push", ecrImageUri], {
            timeout: 10 * 60 * 1000,
            maxBuffer: 8 * 1024 * 1024,
        });
    }
};
exports.DockerBuildService = DockerBuildService;
exports.DockerBuildService = DockerBuildService = __decorate([
    (0, common_1.Injectable)()
], DockerBuildService);
//# sourceMappingURL=docker-build.service.js.map