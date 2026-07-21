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
exports.DeploymentProfileService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const audit_log_service_1 = require("../../audit-log/audit-log.service");
const project_detection_profile_entity_1 = require("../project-detection-profile.entity");
const projects_service_1 = require("../projects.service");
const repository_workspace_service_1 = require("./repository-workspace.service");
const stack_detection_service_1 = require("./stack-detection.service");
let DeploymentProfileService = class DeploymentProfileService {
    constructor(profileRepository, projectsService, repositoryWorkspaceService, stackDetectionService, auditLogService) {
        this.profileRepository = profileRepository;
        this.projectsService = projectsService;
        this.repositoryWorkspaceService = repositoryWorkspaceService;
        this.stackDetectionService = stackDetectionService;
        this.auditLogService = auditLogService;
    }
    async runDetection(user, projectId, req) {
        const project = await this.projectsService.getProjectEntityForManage(user, projectId);
        await this.auditLogService.record({
            actorUser: user,
            action: "STACK_DETECTION_STARTED",
            resourceType: "project",
            resourceId: project.id,
            status: "success",
            metadata: this.auditMetadata(project),
            req,
        });
        let workspacePath = null;
        try {
            const workspace = await this.repositoryWorkspaceService.cloneRepository({
                repositoryUrl: project.repositoryUrl,
                targetBranch: project.targetBranch,
            });
            workspacePath = workspace.workspacePath;
            const draft = this.stackDetectionService.detect(workspace.workspacePath, workspace.commitSha);
            const profile = await this.saveProfile(project, draft);
            await this.auditLogService.record({
                actorUser: user,
                action: "STACK_DETECTION_COMPLETED",
                resourceType: "project",
                resourceId: project.id,
                status: "success",
                metadata: this.auditMetadata(project, profile),
                req,
            });
            await this.auditLogService.record({
                actorUser: user,
                action: "DEPLOYMENT_PROFILE_GENERATED",
                resourceType: "project",
                resourceId: project.id,
                status: "success",
                metadata: this.auditMetadata(project, profile),
                req,
            });
            await this.auditLogService.record({
                actorUser: user,
                action: "TEMPLATE_SELECTED",
                resourceType: "project",
                resourceId: project.id,
                status: "success",
                metadata: this.auditMetadata(project, profile),
                req,
            });
            if (profile.detectionStatus === project_detection_profile_entity_1.DetectionStatus.NEEDS_MANUAL_DOCKERFILE) {
                await this.auditLogService.record({
                    actorUser: user,
                    action: "MANUAL_DOCKERFILE_REQUIRED",
                    resourceType: "project",
                    resourceId: project.id,
                    status: "success",
                    metadata: this.auditMetadata(project, profile),
                    req,
                });
            }
            return this.toProfileResponse(profile);
        }
        catch (error) {
            const profile = await this.saveFailedProfile(project, error);
            await this.auditLogService.record({
                actorUser: user,
                action: "STACK_DETECTION_FAILED",
                resourceType: "project",
                resourceId: project.id,
                status: "failed",
                metadata: this.auditMetadata(project, profile),
                req,
            });
            return this.toProfileResponse(profile);
        }
        finally {
            if (workspacePath) {
                await this.repositoryWorkspaceService.cleanup(workspacePath);
            }
        }
    }
    async getProfile(user, projectId) {
        const project = await this.projectsService.getProjectEntityForView(user, projectId);
        const profile = await this.profileRepository.findOne({
            where: { projectId: project.id },
        });
        if (!profile) {
            throw new common_1.NotFoundException("Detection profile not found");
        }
        return this.toProfileResponse(profile);
    }
    async saveProfile(project, draft) {
        const existing = await this.profileRepository.findOne({
            where: { projectId: project.id },
        });
        const profile = this.profileRepository.create({
            ...(existing || {}),
            projectId: project.id,
            repositoryUrl: project.repositoryUrl,
            repositoryFullName: project.repositoryFullName,
            targetBranch: project.targetBranch,
            ...draft,
        });
        return this.profileRepository.save(profile);
    }
    async saveFailedProfile(project, error) {
        const existing = await this.profileRepository.findOne({
            where: { projectId: project.id },
        });
        const profile = this.profileRepository.create({
            ...(existing || {}),
            projectId: project.id,
            repositoryUrl: project.repositoryUrl,
            repositoryFullName: project.repositoryFullName,
            targetBranch: project.targetBranch,
            commitSha: null,
            ecosystem: "unknown",
            language: null,
            framework: "unknown",
            frameworkVariant: "custom-dockerfile-required",
            packageManager: null,
            runtimeVersion: null,
            buildCommand: null,
            startCommand: null,
            expectedPort: null,
            healthCheckPath: "/",
            requiresDatabase: false,
            databaseType: null,
            requiresPersistentStorage: false,
            staticOutput: false,
            hasDockerfile: false,
            dockerfileRequired: true,
            selectedTemplate: "custom-dockerfile-required",
            confidence: project_detection_profile_entity_1.DetectionConfidence.LOW,
            detectionStatus: project_detection_profile_entity_1.DetectionStatus.FAILED,
            warnings: [],
            errors: [error instanceof Error ? error.message : "Stack detection failed"],
            rawProfile: null,
        });
        return this.profileRepository.save(profile);
    }
    auditMetadata(project, profile) {
        return {
            projectId: project.id,
            repositoryFullName: project.repositoryFullName,
            targetBranch: project.targetBranch,
            ecosystem: profile?.ecosystem,
            framework: profile?.framework,
            frameworkVariant: profile?.frameworkVariant,
            selectedTemplate: profile?.selectedTemplate,
            detectionStatus: profile?.detectionStatus,
            warningsCount: profile?.warnings?.length || 0,
            errorsCount: profile?.errors?.length || 0,
        };
    }
    toProfileResponse(profile) {
        return {
            id: profile.id,
            projectId: profile.projectId,
            repositoryUrl: profile.repositoryUrl,
            repositoryFullName: profile.repositoryFullName,
            targetBranch: profile.targetBranch,
            commitSha: profile.commitSha,
            ecosystem: profile.ecosystem,
            language: profile.language,
            framework: profile.framework,
            frameworkVariant: profile.frameworkVariant,
            packageManager: profile.packageManager,
            runtimeVersion: profile.runtimeVersion,
            buildCommand: profile.buildCommand,
            startCommand: profile.startCommand,
            expectedPort: profile.expectedPort,
            healthCheckPath: profile.healthCheckPath,
            requiresDatabase: profile.requiresDatabase,
            databaseType: profile.databaseType,
            requiresPersistentStorage: profile.requiresPersistentStorage,
            staticOutput: profile.staticOutput,
            dockerfileRequired: profile.dockerfileRequired,
            hasDockerfile: profile.hasDockerfile,
            selectedTemplate: profile.selectedTemplate,
            confidence: profile.confidence,
            detectionStatus: profile.detectionStatus,
            warnings: profile.warnings || [],
            errors: profile.errors || [],
            createdAt: profile.createdAt,
            updatedAt: profile.updatedAt,
        };
    }
};
exports.DeploymentProfileService = DeploymentProfileService;
exports.DeploymentProfileService = DeploymentProfileService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(project_detection_profile_entity_1.ProjectDetectionProfile)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        projects_service_1.ProjectsService,
        repository_workspace_service_1.RepositoryWorkspaceService,
        stack_detection_service_1.StackDetectionService,
        audit_log_service_1.AuditLogService])
], DeploymentProfileService);
//# sourceMappingURL=deployment-profile.service.js.map