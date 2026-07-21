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
exports.TerraformCostPlanService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const child_process_1 = require("child_process");
const fs_1 = require("fs");
const path_1 = require("path");
const util_1 = require("util");
const finops_config_1 = require("./finops.config");
const execFileAsync = (0, util_1.promisify)(child_process_1.execFile);
let TerraformCostPlanService = class TerraformCostPlanService {
    constructor(config) {
        this.config = config;
    }
    getTerraformWorkingDirectory(project) {
        const finopsConfig = (0, finops_config_1.getFinopsConfig)(this.config);
        if (!finopsConfig.terraformWorkdir) {
            return null;
        }
        return (0, path_1.resolve)(process.cwd(), finopsConfig.terraformWorkdir, project.id);
    }
    ensureConfigured(project) {
        const workdir = this.getTerraformWorkingDirectory(project);
        if (!workdir || !(0, fs_1.existsSync)(workdir)) {
            throw new Error("Terraform modules are not configured for cost estimation.");
        }
        return workdir;
    }
    async generateTerraformPlan(project) {
        const workdir = this.ensureConfigured(project);
        const planPath = (0, path_1.join)(workdir, "tfplan");
        await this.run("terraform", ["init", "-input=false"], workdir);
        await this.run("terraform", ["plan", "-out=tfplan", "-input=false"], workdir);
        return { workdir, planPath };
    }
    async convertTerraformPlanToJson(planPath, workdir) {
        const { stdout } = await this.run("terraform", ["show", "-json", planPath], workdir);
        return stdout;
    }
    async run(command, args, cwd) {
        try {
            return await execFileAsync(command, args, {
                cwd,
                timeout: 10 * 60 * 1000,
                maxBuffer: 32 * 1024 * 1024,
            });
        }
        catch (error) {
            const err = error;
            if (err.code === "ENOENT") {
                throw new Error(`${command} CLI is not installed or not available in PATH.`);
            }
            throw new Error(`${command} cost planning command failed.`);
        }
    }
};
exports.TerraformCostPlanService = TerraformCostPlanService;
exports.TerraformCostPlanService = TerraformCostPlanService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], TerraformCostPlanService);
//# sourceMappingURL=terraform-cost-plan.service.js.map