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
exports.TrivyScannerService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const child_process_1 = require("child_process");
const util_1 = require("util");
const execFileAsync = (0, util_1.promisify)(child_process_1.execFile);
let TrivyScannerService = class TrivyScannerService {
    constructor(config) {
        this.config = config;
    }
    async scanImage(imageName) {
        const timeout = Number(this.config.get("TRIVY_TIMEOUT_SECONDS", "300")) * 1000;
        const scannerVersion = await this.getVersion();
        try {
            const { stdout } = await execFileAsync("trivy", ["image", "--format", "json", "--quiet", imageName], {
                timeout,
                maxBuffer: 32 * 1024 * 1024,
            });
            return { scannerVersion, rawJson: stdout };
        }
        catch (error) {
            throw new Error(this.cleanError(error));
        }
    }
    async getVersion() {
        try {
            const { stdout } = await execFileAsync("trivy", ["--version"], {
                timeout: 10000,
                maxBuffer: 1024 * 1024,
            });
            return stdout.split(/\r?\n/)[0]?.trim() || null;
        }
        catch {
            return null;
        }
    }
    cleanError(error) {
        const err = error;
        const message = `${err.message || ""} ${err.stderr || ""}`;
        if (err.code === "ENOENT" || /ENOENT|executable file not found/i.test(message)) {
            return "Trivy is not installed or not available in PATH.";
        }
        if (/No such image|image not known|unable to inspect|image.*not found|not found.*image/i.test(message)) {
            return "Docker image is missing or not available locally.";
        }
        if (/timed out|timeout/i.test(message)) {
            return "Trivy scan timed out.";
        }
        return "Trivy image scan failed.";
    }
};
exports.TrivyScannerService = TrivyScannerService;
exports.TrivyScannerService = TrivyScannerService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], TrivyScannerService);
//# sourceMappingURL=trivy-scanner.service.js.map