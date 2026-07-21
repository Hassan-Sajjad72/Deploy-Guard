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
exports.TerraformRunnerService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const child_process_1 = require("child_process");
const util_1 = require("util");
const infrastructure_config_1 = require("./infrastructure.config");
const execFileAsync = (0, util_1.promisify)(child_process_1.execFile);
let TerraformRunnerService = class TerraformRunnerService {
    constructor(config) {
        this.config = config;
    }
    async runTerraformInit(workdir, env = {}, backendConfigPath) {
        const args = ["init", "-input=false"];
        if (backendConfigPath) {
            args.push(`-backend-config=${backendConfigPath}`);
        }
        else if (backendConfigPath === null) {
            args.push("-backend=false");
        }
        return this.run(args, workdir, env);
    }
    async runTerraformValidate(workdir, env = {}) {
        return this.run(["validate", "-no-color"], workdir, env);
    }
    async runTerraformPlan(workdir, env = {}) {
        return this.run(["plan", "-input=false", "-no-color", "-out=tfplan", "-var-file=terraform.tfvars.json"], workdir, env);
    }
    async runTerraformShowJson(workdir, env = {}) {
        return this.run(["show", "-json", "tfplan"], workdir, env);
    }
    async runTerraformApply(workdir, env = {}) {
        const infraConfig = (0, infrastructure_config_1.getInfrastructureConfig)(this.config);
        const args = ["apply", "-input=false", "-no-color"];
        if (infraConfig.terraformAutoApprove) {
            args.push("-auto-approve");
        }
        args.push("tfplan");
        return this.run(args, workdir, env);
    }
    async parseOutputs(workdir, env = {}) {
        const result = await this.run(["output", "-json"], workdir, env);
        const parsed = JSON.parse(result.stdout || "{}");
        return Object.entries(parsed).reduce((outputs, [key, value]) => {
            outputs[key] = value?.value ?? null;
            return outputs;
        }, {});
    }
    sanitizeTerraformLogs(logs) {
        return logs
            .replace(/AWS_ACCESS_KEY_ID=[^\s]+/gi, "AWS_ACCESS_KEY_ID=[REDACTED]")
            .replace(/AWS_SECRET_ACCESS_KEY=[^\s]+/gi, "AWS_SECRET_ACCESS_KEY=[REDACTED]")
            .replace(/token[=:][^\s]+/gi, "token=[REDACTED]")
            .slice(-12000);
    }
    async run(args, cwd, env) {
        const infraConfig = (0, infrastructure_config_1.getInfrastructureConfig)(this.config);
        try {
            const result = await execFileAsync(infraConfig.terraformBin, args, {
                cwd,
                env: { ...process.env, ...env },
                timeout: 20 * 60 * 1000,
                maxBuffer: 32 * 1024 * 1024,
            });
            return {
                stdout: this.sanitizeTerraformLogs(result.stdout),
                stderr: this.sanitizeTerraformLogs(result.stderr),
            };
        }
        catch (error) {
            const err = error;
            if (err.code === "ENOENT") {
                throw new Error("Terraform CLI is not installed or not available in PATH.");
            }
            const details = this.sanitizeTerraformLogs(err.stderr || err.stdout || "");
            throw new Error(details || "Terraform command failed.");
        }
    }
};
exports.TerraformRunnerService = TerraformRunnerService;
exports.TerraformRunnerService = TerraformRunnerService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], TerraformRunnerService);
//# sourceMappingURL=terraform-runner.service.js.map