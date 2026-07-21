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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TrivyMetricsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const project_security_finding_entity_1 = require("../projects/project-security-finding.entity");
const project_security_scan_entity_1 = require("../projects/project-security-scan.entity");
const log_sanitizer_service_1 = require("./log-sanitizer.service");
const pipeline_metrics_service_1 = require("./pipeline-metrics.service");
const project_stage_metric_entity_1 = require("./project-stage-metric.entity");
let TrivyMetricsService = class TrivyMetricsService {
    constructor(scanRepository, findingRepository, metrics, sanitizer) {
        this.scanRepository = scanRepository;
        this.findingRepository = findingRepository;
        this.metrics = metrics;
        this.sanitizer = sanitizer;
    }
    async saveTrivyMetric(projectId, pipelineRunId) {
        const scan = await this.scanRepository.findOne({
            where: { projectId, pipelineRunId },
            order: { createdAt: "DESC" },
        });
        if (!scan) {
            return null;
        }
        const remediationCount = await this.findingRepository.count({
            where: { projectId, pipelineRunId },
        });
        const durationMs = scan.startedAt && (scan.completedAt || scan.failedAt)
            ? Math.max(0, (scan.completedAt || scan.failedAt).getTime() - scan.startedAt.getTime())
            : null;
        const metadata = this.sanitizer.sanitizeMetadata({
            scanId: scan.id,
            totalVulnerabilities: scan.totalVulnerabilities,
            criticalCount: scan.criticalCount,
            highCount: scan.highCount,
            mediumCount: scan.mediumCount,
            lowCount: scan.lowCount,
            unknownCount: scan.unknownCount,
            policyDecision: scan.policyDecision,
            remediationCount,
            durationMs,
        });
        await this.metrics.startStage(projectId, pipelineRunId, "trivy_scan", project_stage_metric_entity_1.StageMetricSource.TRIVY, metadata);
        if (scan.scanStatus === "failed") {
            return this.metrics.failStage(projectId, pipelineRunId, "trivy_scan", scan.policyReason || "Trivy scan failed.", metadata);
        }
        return this.metrics.completeStage(projectId, pipelineRunId, "trivy_scan", metadata);
    }
    async getLatest(projectId, pipelineRunId) {
        return this.scanRepository.findOne({
            where: { projectId, ...(pipelineRunId ? { pipelineRunId } : {}) },
            order: { createdAt: "DESC" },
        });
    }
};
exports.TrivyMetricsService = TrivyMetricsService;
exports.TrivyMetricsService = TrivyMetricsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(project_security_scan_entity_1.ProjectSecurityScan)),
    __param(1, (0, typeorm_1.InjectRepository)(project_security_finding_entity_1.ProjectSecurityFinding)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        pipeline_metrics_service_1.PipelineMetricsService,
        log_sanitizer_service_1.LogSanitizerService])
], TrivyMetricsService);
//# sourceMappingURL=trivy-metrics.service.js.map