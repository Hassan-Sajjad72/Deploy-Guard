"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LogSanitizerService = void 0;
const common_1 = require("@nestjs/common");
let LogSanitizerService = class LogSanitizerService {
    sanitize(value) {
        if (value === undefined || value === null) {
            return "";
        }
        return this.mask(String(value));
    }
    sanitizeMetadata(metadata = {}) {
        const allowed = [
            "projectId",
            "pipelineRunId",
            "deploymentId",
            "stageName",
            "source",
            "status",
            "reason",
            "durationMs",
            "workflowRunId",
            "workflowName",
            "branch",
            "commitSha",
            "htmlUrl",
            "scanId",
            "totalVulnerabilities",
            "criticalCount",
            "highCount",
            "mediumCount",
            "lowCount",
            "unknownCount",
            "policyDecision",
            "remediationCount",
            "metricName",
            "metricUnit",
            "range",
            "stream",
            "limit",
            "sourceStatus",
            "logGroupName",
            "logStreamName",
        ];
        return Object.entries(metadata).reduce((safe, [key, value]) => {
            if (!allowed.includes(key) || value === undefined) {
                return safe;
            }
            safe[key] = typeof value === "string" ? this.mask(value) : value;
            return safe;
        }, {});
    }
    mask(input) {
        return input
            .replace(/AKIA[0-9A-Z]{16}/g, "[REDACTED_AWS_ACCESS_KEY]")
            .replace(/aws_secret_access_key\s*=\s*[^\s]+/gi, "AWS_SECRET_ACCESS_KEY=[REDACTED]")
            .replace(/gh[pousr]_[A-Za-z0-9_]{20,}/g, "[REDACTED_GITHUB_TOKEN]")
            .replace(/Bearer\s+[A-Za-z0-9._~+/=-]{12,}/gi, "Bearer [REDACTED]")
            .replace(/eyJ[A-Za-z0-9._-]{20,}/g, "[REDACTED_JWT]")
            .replace(/(password|passwd|pwd)\s*[:=]\s*[^\s]+/gi, "$1=[REDACTED]")
            .replace(/(api[_-]?key|token|secret|authorization|oauth[_-]?code)\s*[:=]\s*[^\s]+/gi, "$1=[REDACTED]")
            .replace(/-----BEGIN [A-Z ]*PRIVATE KEY-----[\s\S]*?-----END [A-Z ]*PRIVATE KEY-----/g, "[REDACTED_PRIVATE_KEY]")
            .replace(/([a-z]+:\/\/[^:\s]+):([^@\s]+)@/gi, "$1:[REDACTED]@");
    }
};
exports.LogSanitizerService = LogSanitizerService;
exports.LogSanitizerService = LogSanitizerService = __decorate([
    (0, common_1.Injectable)()
], LogSanitizerService);
//# sourceMappingURL=log-sanitizer.service.js.map