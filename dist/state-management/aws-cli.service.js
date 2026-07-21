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
exports.AwsCliService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const child_process_1 = require("child_process");
const util_1 = require("util");
const state_management_config_1 = require("./state-management.config");
const execFileAsync = (0, util_1.promisify)(child_process_1.execFile);
let AwsCliService = class AwsCliService {
    constructor(config) {
        this.config = config;
    }
    async run(args) {
        const stateConfig = (0, state_management_config_1.getStateManagementConfig)(this.config);
        if (stateConfig.mockMode) {
            return { stdout: "{}", stderr: "" };
        }
        try {
            const result = await execFileAsync("aws", args, {
                env: {
                    ...process.env,
                    AWS_REGION: stateConfig.region,
                    AWS_ACCESS_KEY_ID: this.config.get("AWS_ACCESS_KEY_ID", ""),
                    AWS_SECRET_ACCESS_KEY: this.config.get("AWS_SECRET_ACCESS_KEY", ""),
                },
                timeout: 120000,
                maxBuffer: 16 * 1024 * 1024,
            });
            return {
                stdout: this.sanitize(String(result.stdout || "")),
                stderr: this.sanitize(String(result.stderr || "")),
            };
        }
        catch (error) {
            const err = error;
            if (err.code === "ENOENT") {
                throw new Error("AWS CLI is not installed or not available in PATH.");
            }
            throw new Error(this.sanitize(err.stderr || err.stdout || "AWS CLI command failed."));
        }
    }
    sanitize(value) {
        return value
            .replace(/AWS_ACCESS_KEY_ID[=:\s]+[^\s"]+/gi, "AWS_ACCESS_KEY_ID=[REDACTED]")
            .replace(/AWS_SECRET_ACCESS_KEY[=:\s]+[^\s"]+/gi, "AWS_SECRET_ACCESS_KEY=[REDACTED]")
            .replace(/token[=:\s]+[^\s"]+/gi, "token=[REDACTED]");
    }
};
exports.AwsCliService = AwsCliService;
exports.AwsCliService = AwsCliService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], AwsCliService);
//# sourceMappingURL=aws-cli.service.js.map