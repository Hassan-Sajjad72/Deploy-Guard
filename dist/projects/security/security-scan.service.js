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
exports.SecurityScanService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const audit_log_service_1 = require("../../audit-log/audit-log.service");
const project_detection_profile_entity_1 = require("../project-detection-profile.entity");
const project_pipeline_run_entity_1 = require("../project-pipeline-run.entity");
const project_security_finding_entity_1 = require("../project-security-finding.entity");
const project_security_scan_entity_1 = require("../project-security-scan.entity");
const projects_service_1 = require("../projects.service");
const remediation_service_1 = require("./remediation.service");
const security_policy_service_1 = require("./security-policy.service");
const trivy_parser_service_1 = require("./trivy-parser.service");
const trivy_scanner_service_1 = require("./trivy-scanner.service");
let SecurityScanService = class SecurityScanService {
    constructor(scanRepository, findingRepository, pipelineRunRepository, profileRepository, projectsService, trivyScannerService, trivyParserService, securityPolicyService, remediationService, auditLogService) {
        this.scanRepository = scanRepository;
        this.findingRepository = findingRepository;
        this.pipelineRunRepository = pipelineRunRepository;
        this.profileRepository = profileRepository;
        this.projectsService = projectsService;
        this.trivyScannerService = trivyScannerService;
        this.trivyParserService = trivyParserService;
        this.securityPolicyService = securityPolicyService;
        this.remediationService = remediationService;
        this.auditLogService = auditLogService;
    }
    async triggerScan(user, projectId, dto, req) {
        const project = await this.projectsService.getProjectEntityForManage(user, projectId);
        const pipelineRun = dto.pipelineRunId
            ? await this.findPipelineRun(project.id, dto.pipelineRunId)
            : await this.findLatestPipelineRun(project.id);
        const imageName = dto.imageName || this.imageFromPipelineRun(pipelineRun);
        if (!imageName) {
            throw new common_1.BadRequestException("No built image is available to scan");
        }
        const scan = await this.scanImage({
            project,
            imageName,
            pipelineRun,
            actorUser: user,
            req,
        });
        return this.toScanResponse(scan);
    }
    async scanImage(input) {
        const image = this.parseImageName(input.imageName);
        const scan = await this.scanRepository.save(this.scanRepository.create({
            projectId: input.project.id,
            pipelineRunId: input.pipelineRun?.id || null,
            imageName: image.name,
            imageTag: image.tag,
            imageUri: input.imageName,
            scanner: "trivy",
            scanStatus: project_security_scan_entity_1.SecurityScanStatus.QUEUED,
        }));
        await this.audit("SECURITY_SCAN_STARTED", scan, input.actorUser, "success", {
            projectId: input.project.id,
            pipelineRunId: input.pipelineRun?.id,
            scanId: scan.id,
            imageName: scan.imageName,
            imageTag: scan.imageTag,
        }, input.req);
        try {
            scan.scanStatus = project_security_scan_entity_1.SecurityScanStatus.RUNNING;
            scan.startedAt = new Date();
            await this.scanRepository.save(scan);
            const rawScan = await this.trivyScannerService.scanImage(input.imageName);
            scan.scannerVersion = rawScan.scannerVersion || null;
            const parsed = this.trivyParserService.parse(rawScan.rawJson);
            const profile = await this.profileRepository.findOne({
                where: { projectId: input.project.id },
            });
            const policy = this.securityPolicyService.evaluate(parsed.counts);
            scan.scanStatus = project_security_scan_entity_1.SecurityScanStatus.COMPLETED;
            scan.completedAt = new Date();
            scan.totalVulnerabilities = parsed.counts.total;
            scan.criticalCount = parsed.counts.critical;
            scan.highCount = parsed.counts.high;
            scan.mediumCount = parsed.counts.medium;
            scan.lowCount = parsed.counts.low;
            scan.unknownCount = parsed.counts.unknown;
            scan.policyDecision = policy.policyDecision;
            scan.policyReason = policy.policyReason;
            scan.manualApprovalRequired = policy.manualApprovalRequired;
            scan.rawSummary = parsed.summary;
            const savedScan = await this.scanRepository.save(scan);
            await this.findingRepository.delete({ scanId: savedScan.id });
            const findings = parsed.findings.map((finding) => this.findingRepository.create({
                scanId: savedScan.id,
                projectId: input.project.id,
                pipelineRunId: input.pipelineRun?.id || null,
                vulnerabilityId: finding.vulnerabilityId,
                severity: finding.severity,
                packageName: finding.packageName,
                installedVersion: finding.installedVersion,
                fixedVersion: finding.fixedVersion,
                target: finding.target,
                type: finding.type,
                title: finding.title,
                description: finding.description,
                primaryUrl: finding.primaryUrl,
                remediation: this.remediationService.remediate(finding, profile),
            }));
            if (findings.length > 0) {
                await this.findingRepository.save(findings);
            }
            await this.audit("SECURITY_FINDINGS_NORMALIZED", savedScan, input.actorUser, "success", {
                projectId: input.project.id,
                pipelineRunId: input.pipelineRun?.id,
                scanId: savedScan.id,
                criticalCount: savedScan.criticalCount,
                highCount: savedScan.highCount,
                mediumCount: savedScan.mediumCount,
                lowCount: savedScan.lowCount,
            }, input.req);
            await this.audit("SECURITY_POLICY_EVALUATED", savedScan, input.actorUser, "success", {
                projectId: input.project.id,
                pipelineRunId: input.pipelineRun?.id,
                scanId: savedScan.id,
                policyDecision: savedScan.policyDecision,
                criticalCount: savedScan.criticalCount,
                highCount: savedScan.highCount,
                mediumCount: savedScan.mediumCount,
                lowCount: savedScan.lowCount,
            }, input.req);
            if (savedScan.policyDecision === project_security_scan_entity_1.SecurityPolicyDecision.BLOCKED) {
                await this.audit("SECURITY_DEPLOYMENT_BLOCKED", savedScan, input.actorUser, "failed", {
                    projectId: input.project.id,
                    pipelineRunId: input.pipelineRun?.id,
                    scanId: savedScan.id,
                    policyDecision: savedScan.policyDecision,
                    reason: savedScan.policyReason,
                }, input.req);
            }
            else if (savedScan.policyDecision === project_security_scan_entity_1.SecurityPolicyDecision.REQUIRES_APPROVAL) {
                await this.audit("SECURITY_APPROVAL_REQUIRED", savedScan, input.actorUser, "success", {
                    projectId: input.project.id,
                    pipelineRunId: input.pipelineRun?.id,
                    scanId: savedScan.id,
                    policyDecision: savedScan.policyDecision,
                    reason: savedScan.policyReason,
                }, input.req);
            }
            else {
                await this.audit("SECURITY_GATE_PASSED", savedScan, input.actorUser, "success", {
                    projectId: input.project.id,
                    pipelineRunId: input.pipelineRun?.id,
                    scanId: savedScan.id,
                    policyDecision: savedScan.policyDecision,
                }, input.req);
            }
            await this.audit("SECURITY_SCAN_COMPLETED", savedScan, input.actorUser, "success", {
                projectId: input.project.id,
                pipelineRunId: input.pipelineRun?.id,
                scanId: savedScan.id,
                policyDecision: savedScan.policyDecision,
                criticalCount: savedScan.criticalCount,
                highCount: savedScan.highCount,
                mediumCount: savedScan.mediumCount,
                lowCount: savedScan.lowCount,
            }, input.req);
            return savedScan;
        }
        catch (error) {
            const message = error instanceof Error ? error.message : "Security scan failed.";
            scan.scanStatus = project_security_scan_entity_1.SecurityScanStatus.FAILED;
            scan.failedAt = new Date();
            scan.policyDecision = project_security_scan_entity_1.SecurityPolicyDecision.BLOCKED;
            scan.policyReason = this.publicError(message);
            scan.manualApprovalRequired = false;
            const failedScan = await this.scanRepository.save(scan);
            await this.audit("SECURITY_SCAN_FAILED", failedScan, input.actorUser, "failed", {
                projectId: input.project.id,
                pipelineRunId: input.pipelineRun?.id,
                scanId: failedScan.id,
                policyDecision: failedScan.policyDecision,
                reason: failedScan.policyReason,
            }, input.req);
            throw new common_1.BadRequestException(failedScan.policyReason);
        }
    }
    async listScans(user, projectId) {
        const project = await this.projectsService.getProjectEntityForView(user, projectId);
        const scans = await this.scanRepository.find({
            where: { projectId: project.id },
            order: { createdAt: "DESC" },
            take: 50,
        });
        return scans.map((scan) => this.toScanResponse(scan));
    }
    async getScan(user, projectId, scanId) {
        const project = await this.projectsService.getProjectEntityForView(user, projectId);
        const scan = await this.findScan(project.id, scanId);
        return this.toScanResponse(scan);
    }
    async listFindings(user, projectId, scanId, query) {
        const project = await this.projectsService.getProjectEntityForView(user, projectId);
        await this.findScan(project.id, scanId);
        const page = Math.max(Number(query.page || 1), 1);
        const limit = Math.min(Math.max(Number(query.limit || 20), 1), 100);
        const where = {
            projectId: project.id,
            scanId,
        };
        if (query.severity) {
            where.severity = String(query.severity).toUpperCase();
        }
        if (query.packageName) {
            where.packageName = (0, typeorm_2.ILike)(`%${query.packageName}%`);
        }
        if (query.vulnerabilityId) {
            where.vulnerabilityId = (0, typeorm_2.ILike)(`%${query.vulnerabilityId}%`);
        }
        const [findings, total] = await this.findingRepository.findAndCount({
            where,
            order: { severity: "ASC", createdAt: "DESC" },
            skip: (page - 1) * limit,
            take: limit,
        });
        return {
            findings,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    async approveScan(user, projectId, scanId, dto, req) {
        const project = await this.projectsService.getProjectEntityForManage(user, projectId);
        const scan = await this.findScan(project.id, scanId);
        if (!this.securityPolicyService.canApprove(scan)) {
            await this.audit("SECURITY_SCAN_OVERRIDE_REJECTED", scan, user, "failed", {
                projectId: project.id,
                pipelineRunId: scan.pipelineRunId,
                scanId: scan.id,
                policyDecision: scan.policyDecision,
                approvalUserId: user.id,
            }, req);
            throw new common_1.ForbiddenException("This security scan cannot be approved");
        }
        if (!dto.reason?.trim()) {
            throw new common_1.BadRequestException("Approval reason is required");
        }
        scan.policyDecision = project_security_scan_entity_1.SecurityPolicyDecision.APPROVED_OVERRIDE;
        scan.manualApprovalRequired = false;
        scan.approvedByUserId = user.id;
        scan.approvedAt = new Date();
        scan.approvalReason = this.limitUserText(dto.reason.trim());
        const savedScan = await this.scanRepository.save(scan);
        await this.audit("SECURITY_SCAN_APPROVED", savedScan, user, "success", {
            projectId: project.id,
            pipelineRunId: savedScan.pipelineRunId,
            scanId: savedScan.id,
            policyDecision: savedScan.policyDecision,
            approvalUserId: user.id,
            reason: this.sanitizeUserEnteredReason(savedScan.approvalReason),
        }, req);
        return this.toScanResponse(savedScan);
    }
    async findPipelineRun(projectId, pipelineRunId) {
        const run = await this.pipelineRunRepository.findOne({
            where: { id: pipelineRunId, projectId },
        });
        if (!run) {
            throw new common_1.NotFoundException("Pipeline run not found");
        }
        return run;
    }
    async findLatestPipelineRun(projectId) {
        return this.pipelineRunRepository.findOne({
            where: { projectId },
            order: { createdAt: "DESC" },
        });
    }
    imageFromPipelineRun(run) {
        if (!run?.imageName || !run.imageTag) {
            return null;
        }
        return `${run.imageName}:${run.imageTag}`;
    }
    async findScan(projectId, scanId) {
        const scan = await this.scanRepository.findOne({
            where: { id: scanId, projectId },
        });
        if (!scan) {
            throw new common_1.NotFoundException("Security scan not found");
        }
        return scan;
    }
    parseImageName(imageName) {
        const lastSlash = imageName.lastIndexOf("/");
        const lastColon = imageName.lastIndexOf(":");
        if (lastColon > lastSlash) {
            return {
                name: imageName.slice(0, lastColon),
                tag: imageName.slice(lastColon + 1),
            };
        }
        return { name: imageName, tag: null };
    }
    async audit(action, scan, actorUser, status, metadata, req) {
        await this.auditLogService.record({
            actorUser,
            action,
            resourceType: "security_scan",
            resourceId: scan.id,
            status,
            metadata: this.safeMetadata(metadata),
            req,
        });
    }
    safeMetadata(metadata) {
        const allowed = [
            "projectId",
            "pipelineRunId",
            "scanId",
            "imageName",
            "imageTag",
            "criticalCount",
            "highCount",
            "mediumCount",
            "lowCount",
            "policyDecision",
            "approvalUserId",
            "reason",
        ];
        return Object.entries(metadata).reduce((safe, [key, value]) => {
            if (allowed.includes(key) && value !== undefined) {
                safe[key] = value;
            }
            return safe;
        }, {});
    }
    publicError(message) {
        if (/token|secret|password|credential|authorization|cookie/i.test(message)) {
            return "Security scan failed because required scanner credentials or access are invalid.";
        }
        return message;
    }
    limitUserText(value) {
        return value.slice(0, 500);
    }
    sanitizeUserEnteredReason(value) {
        if (!value) {
            return value;
        }
        return this.limitUserText(value)
            .replace(/-----BEGIN [\s\S]+?-----END [^-]+-----/g, "[REDACTED_SECRET]")
            .replace(/\b(AKIA|ASIA)[A-Z0-9]{16}\b/g, "[REDACTED_SECRET]")
            .replace(/\bgh[pousr]_[A-Za-z0-9_]{20,}\b/g, "[REDACTED_SECRET]")
            .replace(/\bgithub_pat_[A-Za-z0-9_]{20,}\b/g, "[REDACTED_SECRET]")
            .replace(/\b[A-Za-z0-9+/=_-]{40,}\b/g, "[REDACTED_SECRET]")
            .replace(/\b(password|token|secret|credential|authorization|oauth[_-]?code|session)[\s:=]+[^\s,;]+/gi, "$1=[REDACTED_SECRET]");
    }
    toScanResponse(scan) {
        return {
            id: scan.id,
            projectId: scan.projectId,
            pipelineRunId: scan.pipelineRunId,
            imageName: scan.imageName,
            imageTag: scan.imageTag,
            imageUri: scan.imageUri,
            scanner: scan.scanner,
            scannerVersion: scan.scannerVersion,
            scanStatus: scan.scanStatus,
            startedAt: scan.startedAt,
            completedAt: scan.completedAt,
            failedAt: scan.failedAt,
            totalVulnerabilities: scan.totalVulnerabilities,
            criticalCount: scan.criticalCount,
            highCount: scan.highCount,
            mediumCount: scan.mediumCount,
            lowCount: scan.lowCount,
            unknownCount: scan.unknownCount,
            policyDecision: scan.policyDecision,
            policyReason: scan.policyReason,
            manualApprovalRequired: scan.manualApprovalRequired,
            approvedByUserId: scan.approvedByUserId,
            approvedAt: scan.approvedAt,
            approvalReason: scan.approvalReason,
            rawSummary: scan.rawSummary,
            createdAt: scan.createdAt,
            updatedAt: scan.updatedAt,
        };
    }
};
exports.SecurityScanService = SecurityScanService;
exports.SecurityScanService = SecurityScanService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(project_security_scan_entity_1.ProjectSecurityScan)),
    __param(1, (0, typeorm_1.InjectRepository)(project_security_finding_entity_1.ProjectSecurityFinding)),
    __param(2, (0, typeorm_1.InjectRepository)(project_pipeline_run_entity_1.ProjectPipelineRun)),
    __param(3, (0, typeorm_1.InjectRepository)(project_detection_profile_entity_1.ProjectDetectionProfile)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        projects_service_1.ProjectsService,
        trivy_scanner_service_1.TrivyScannerService,
        trivy_parser_service_1.TrivyParserService,
        security_policy_service_1.SecurityPolicyService,
        remediation_service_1.RemediationService,
        audit_log_service_1.AuditLogService])
], SecurityScanService);
//# sourceMappingURL=security-scan.service.js.map