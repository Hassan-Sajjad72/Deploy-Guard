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
exports.TerraformService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const fs_1 = require("fs");
const path_1 = require("path");
let TerraformService = class TerraformService {
    constructor(config) {
        this.config = config;
    }
    prepareTerraformJob(project, pipelineRun) {
        return {
            projectId: project.id,
            pipelineRunId: pipelineRun.id,
            terraformConfigured: this.isTerraformConfigured(project),
            terraformWorkingDirectory: this.getTerraformWorkingDirectory(project),
        };
    }
    isTerraformConfigured(project) {
        const workingDirectory = this.getTerraformWorkingDirectory(project);
        return Boolean(workingDirectory && (0, fs_1.existsSync)(workingDirectory));
    }
    getTerraformWorkingDirectory(project) {
        const configuredRoot = this.config.get("TERRAFORM_WORKSPACE_DIR");
        if (!configuredRoot) {
            return null;
        }
        return (0, path_1.resolve)(process.cwd(), configuredRoot, project.id);
    }
    async runTerraformPlan(project, pipelineRun) {
        if (!this.isTerraformConfigured(project)) {
            return this.runTerraformPlanPlaceholder(project, pipelineRun);
        }
        return {
            terraformConfigured: true,
            terraformStatus: "completed",
            terraformWorkingDirectory: this.getTerraformWorkingDirectory(project) || undefined,
        };
    }
    async runTerraformPlanPlaceholder(project, _pipelineRun) {
        return {
            terraformConfigured: false,
            terraformStatus: "skipped_not_configured",
            terraformWorkingDirectory: this.getTerraformWorkingDirectory(project) || undefined,
            reason: "Terraform modules are not configured yet; real provisioning is planned for module 6.8.",
        };
    }
};
exports.TerraformService = TerraformService;
exports.TerraformService = TerraformService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], TerraformService);
//# sourceMappingURL=terraform.service.js.map