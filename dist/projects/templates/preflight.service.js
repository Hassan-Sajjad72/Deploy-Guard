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
exports.PreflightService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const audit_log_service_1 = require("../../audit-log/audit-log.service");
const project_detection_profile_entity_1 = require("../project-detection-profile.entity");
const project_environment_variable_entity_1 = require("../project-environment-variable.entity");
const project_preflight_report_entity_1 = require("../project-preflight-report.entity");
const projects_service_1 = require("../projects.service");
const docker_template_engine_service_1 = require("./docker-template-engine.service");
const template_registry_service_1 = require("./template-registry.service");
let PreflightService = class PreflightService {
    constructor(reportRepository, profileRepository, envVarRepository, projectsService, templateRegistryService, dockerTemplateEngineService, auditLogService) {
        this.reportRepository = reportRepository;
        this.profileRepository = profileRepository;
        this.envVarRepository = envVarRepository;
        this.projectsService = projectsService;
        this.templateRegistryService = templateRegistryService;
        this.dockerTemplateEngineService = dockerTemplateEngineService;
        this.auditLogService = auditLogService;
    }
    async generateReport(user, projectId, req) {
        const project = await this.projectsService.getProjectEntityForManage(user, projectId);
        await this.audit("PREFLIGHT_STARTED", user, project, undefined, req);
        try {
            const profile = await this.getProfile(project.id);
            const report = await this.buildReport(project, profile);
            const savedReport = await this.saveReport(project, profile, report);
            await this.audit("PREFLIGHT_COMPLETED", user, project, savedReport, req);
            if (savedReport.generatedDockerfile) {
                await this.audit("TEMPLATE_INJECTED", user, project, savedReport, req);
            }
            if (savedReport.validationStatus ===
                project_preflight_report_entity_1.PreflightValidationStatus.MANUAL_DOCKERFILE_REQUIRED) {
                await this.audit("MANUAL_DOCKERFILE_REQUIRED", user, project, savedReport, req);
            }
            return this.toReportResponse(savedReport);
        }
        catch (error) {
            await this.audit("PREFLIGHT_FAILED", user, project, undefined, req);
            throw error;
        }
    }
    async getReport(user, projectId) {
        const project = await this.projectsService.getProjectEntityForView(user, projectId);
        const report = await this.reportRepository.findOne({
            where: { projectId: project.id },
        });
        if (!report) {
            throw new common_1.NotFoundException("Pre-flight report not found");
        }
        return this.toReportResponse(report);
    }
    listTemplates() {
        return this.templateRegistryService.listTemplates();
    }
    async buildReport(project, profile) {
        const validations = [];
        const warnings = [];
        const errors = [];
        const template = this.templateRegistryService.getTemplate(profile.selectedTemplate || "");
        const envVars = await this.envVarRepository.find({
            where: { projectId: project.id },
            order: { key: "ASC" },
        });
        this.addCheck(validations, "DETECTION_PROFILE_EXISTS", true, "Detection profile exists.");
        this.addCheck(validations, "PROJECT_REPOSITORY_URL", Boolean(project.repositoryUrl), "Project has repository URL.", errors);
        this.addCheck(validations, "PROJECT_TARGET_BRANCH", Boolean(project.targetBranch), "Project has target branch.", errors);
        this.addCheck(validations, "SELECTED_TEMPLATE_EXISTS", Boolean(profile.selectedTemplate), "Detection selected a template.", errors);
        this.addCheck(validations, "SUPPORTED_TEMPLATE", Boolean(template), "A supported template was found.", errors);
        this.addCheck(validations, "SUPPORTED_FRAMEWORK", this.isSupportedFramework(profile), "Framework is supported for pre-flight.", errors);
        this.addCheck(validations, "SUPPORTED_ECOSYSTEM", ["node", "python"].includes(profile.ecosystem) || profile.selectedTemplate?.startsWith("custom-dockerfile"), "Ecosystem is supported for pre-flight.", errors);
        this.addCheck(validations, "EXPECTED_PORT", Boolean(profile.expectedPort || template?.defaultPort || profile.selectedTemplate?.startsWith("custom-dockerfile")), "Expected port exists or safe default exists.", errors);
        this.addCheck(validations, "START_COMMAND", Boolean(profile.startCommand || profile.staticOutput || profile.hasDockerfile || profile.dockerfileRequired), "Start command exists or is not required.", errors);
        this.addCheck(validations, "ENV_VALUES_NOT_INCLUDED", true, "Environment variable values are not included in report.");
        if (!template) {
            throw new common_1.ForbiddenException("Unsupported deployment template");
        }
        this.addCheck(validations, "BUILD_COMMAND", !template.requiredCommands.includes("build") || Boolean(profile.buildCommand), "Build command exists where required.", errors);
        const generatedDockerfile = profile.hasDockerfile ||
            profile.selectedTemplate === "custom-dockerfile" ||
            profile.selectedTemplate === "custom-dockerfile-required"
            ? null
            : this.dockerTemplateEngineService.renderDockerfile(template, profile);
        if (profile.selectedTemplate === "custom-dockerfile-required") {
            warnings.push("No safe automatic template was found. Please provide a custom Dockerfile.");
        }
        warnings.push(...template.warnings);
        if (!this.hasDockerignore(profile)) {
            warnings.push(".dockerignore was not found; the worker will generate a safe build-only default.");
        }
        const validationStatus = this.validationStatus(profile, errors, warnings);
        const report = {
            project: {
                id: project.id,
                name: project.name,
                repositoryUrl: project.repositoryUrl,
                repositoryFullName: project.repositoryFullName,
                targetBranch: project.targetBranch,
            },
            detectedStack: {
                ecosystem: profile.ecosystem,
                framework: profile.framework,
                frameworkVariant: profile.frameworkVariant,
                packageManager: profile.packageManager,
                runtimeVersion: profile.runtimeVersion,
            },
            deploymentProfile: {
                buildCommand: profile.buildCommand,
                startCommand: profile.startCommand,
                expectedPort: profile.expectedPort || template.defaultPort || null,
                healthCheckPath: profile.healthCheckPath,
                requiresDatabase: profile.requiresDatabase,
                requiresPersistentStorage: profile.requiresPersistentStorage,
                staticOutput: profile.staticOutput,
            },
            template: {
                templateKey: template.templateKey,
                displayName: template.displayName,
                baseImage: template.baseImage,
                runtimeImage: template.runtimeImage,
                usesMultiStageBuild: template.usesMultiStageBuild,
                securityLevel: template.securityLevel,
            },
            dockerfile: {
                willGenerate: Boolean(generatedDockerfile),
                usesExistingDockerfile: profile.hasDockerfile,
                dockerfileRequired: profile.dockerfileRequired,
                contentPreview: generatedDockerfile,
            },
            environmentVariables: {
                count: envVars.length,
                keys: envVars.map((envVar) => envVar.key),
                containsSecretValues: false,
                valuesIncluded: false,
            },
            validations,
            warnings,
            errors,
        };
        return { report, template, generatedDockerfile, validationStatus, warnings, errors };
    }
    async saveReport(project, profile, builtReport) {
        const existing = await this.reportRepository.findOne({
            where: { projectId: project.id },
        });
        const report = this.reportRepository.create({
            ...(existing || {}),
            projectId: project.id,
            detectionProfileId: profile.id,
            templateKey: builtReport.template.templateKey,
            templateDisplayName: builtReport.template.displayName,
            ecosystem: profile.ecosystem,
            framework: profile.framework,
            frameworkVariant: profile.frameworkVariant,
            packageManager: profile.packageManager,
            runtimeVersion: profile.runtimeVersion,
            expectedPort: profile.expectedPort || builtReport.template.defaultPort || null,
            buildCommand: profile.buildCommand,
            startCommand: profile.startCommand,
            healthCheckPath: profile.healthCheckPath,
            hasDockerfile: profile.hasDockerfile,
            dockerfileRequired: profile.dockerfileRequired,
            generatedDockerfile: builtReport.generatedDockerfile,
            report: builtReport.report,
            validationStatus: builtReport.validationStatus,
            warnings: builtReport.warnings,
            errors: builtReport.errors,
        });
        return this.reportRepository.save(report);
    }
    async getProfile(projectId) {
        const profile = await this.profileRepository.findOne({ where: { projectId } });
        if (!profile) {
            throw new common_1.NotFoundException("Run stack detection before pre-flight validation");
        }
        return profile;
    }
    addCheck(validations, code, passed, message, errors) {
        validations.push({ code, status: passed ? "passed" : "failed", message });
        if (!passed && errors) {
            errors.push(message);
        }
    }
    isSupportedFramework(profile) {
        if (profile.selectedTemplate?.startsWith("custom-dockerfile")) {
            return true;
        }
        return [
            "nextjs",
            "express",
            "django",
            "fastapi",
            "flask",
            "unknown",
        ].includes(profile.framework || "unknown");
    }
    validationStatus(profile, errors, warnings) {
        if (profile.selectedTemplate === "custom-dockerfile-required") {
            return project_preflight_report_entity_1.PreflightValidationStatus.MANUAL_DOCKERFILE_REQUIRED;
        }
        if (errors.length > 0) {
            return project_preflight_report_entity_1.PreflightValidationStatus.FAILED;
        }
        return warnings.length > 0
            ? project_preflight_report_entity_1.PreflightValidationStatus.PASSED_WITH_WARNINGS
            : project_preflight_report_entity_1.PreflightValidationStatus.PASSED;
    }
    hasDockerignore(profile) {
        const rawProfile = profile.rawProfile;
        return Array.isArray(rawProfile?.rootFiles)
            ? rawProfile.rootFiles.includes(".dockerignore")
            : false;
    }
    async audit(action, user, project, report, req) {
        await this.auditLogService.record({
            actorUser: user,
            action,
            resourceType: "project",
            resourceId: project.id,
            status: action === "PREFLIGHT_FAILED" ? "failed" : "success",
            metadata: {
                projectId: project.id,
                repositoryFullName: project.repositoryFullName,
                templateKey: report?.templateKey,
                ecosystem: report?.ecosystem,
                framework: report?.framework,
                validationStatus: report?.validationStatus,
                warningsCount: report?.warnings?.length || 0,
                errorsCount: report?.errors?.length || 0,
            },
            req,
        });
    }
    toReportResponse(report) {
        return {
            id: report.id,
            projectId: report.projectId,
            detectionProfileId: report.detectionProfileId,
            templateKey: report.templateKey,
            templateDisplayName: report.templateDisplayName,
            ecosystem: report.ecosystem,
            framework: report.framework,
            frameworkVariant: report.frameworkVariant,
            packageManager: report.packageManager,
            runtimeVersion: report.runtimeVersion,
            expectedPort: report.expectedPort,
            buildCommand: report.buildCommand,
            startCommand: report.startCommand,
            healthCheckPath: report.healthCheckPath,
            hasDockerfile: report.hasDockerfile,
            dockerfileRequired: report.dockerfileRequired,
            generatedDockerfile: report.generatedDockerfile,
            report: report.report,
            validationStatus: report.validationStatus,
            warnings: report.warnings || [],
            errors: report.errors || [],
            createdAt: report.createdAt,
            updatedAt: report.updatedAt,
        };
    }
};
exports.PreflightService = PreflightService;
exports.PreflightService = PreflightService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(project_preflight_report_entity_1.ProjectPreflightReport)),
    __param(1, (0, typeorm_1.InjectRepository)(project_detection_profile_entity_1.ProjectDetectionProfile)),
    __param(2, (0, typeorm_1.InjectRepository)(project_environment_variable_entity_1.ProjectEnvironmentVariable)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        projects_service_1.ProjectsService,
        template_registry_service_1.TemplateRegistryService,
        docker_template_engine_service_1.DockerTemplateEngineService,
        audit_log_service_1.AuditLogService])
], PreflightService);
//# sourceMappingURL=preflight.service.js.map