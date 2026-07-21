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
exports.ProjectsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const audit_log_service_1 = require("../audit-log/audit-log.service");
const user_entity_1 = require("../users/user.entity");
const project_environment_variable_entity_1 = require("./project-environment-variable.entity");
const project_entity_1 = require("./project.entity");
let ProjectsService = class ProjectsService {
    constructor(projectRepository, envVarRepository, auditLogService) {
        this.projectRepository = projectRepository;
        this.envVarRepository = envVarRepository;
        this.auditLogService = auditLogService;
    }
    async listProjects(user) {
        const where = user.role === user_entity_1.UserRole.ADMIN
            ? { status: (0, typeorm_2.Not)(project_entity_1.ProjectStatus.ARCHIVED) }
            : user.role === user_entity_1.UserRole.DEVELOPER
                ? { ownerUserId: user.id, status: (0, typeorm_2.Not)(project_entity_1.ProjectStatus.ARCHIVED) }
                : [
                    { ownerUserId: user.id, status: (0, typeorm_2.Not)(project_entity_1.ProjectStatus.ARCHIVED) },
                    {
                        visibility: project_entity_1.ProjectVisibility.WORKSPACE,
                        status: (0, typeorm_2.Not)(project_entity_1.ProjectStatus.ARCHIVED),
                    },
                ];
        const projects = await this.projectRepository.find({
            where,
            order: { createdAt: "DESC" },
        });
        return projects.map((project) => this.toProjectResponse(project, user));
    }
    async createProject(user, dto, req) {
        this.assertCanWrite(user);
        const repositoryFullName = this.parseGitHubRepositoryFullName(dto.repositoryUrl);
        const project = this.projectRepository.create({
            ownerUserId: user.id,
            name: dto.name.trim(),
            description: dto.description || null,
            repositoryUrl: this.normalizeRepositoryUrl(dto.repositoryUrl),
            repositoryProvider: "github",
            repositoryFullName,
            targetBranch: dto.targetBranch || "main",
            visibility: dto.visibility || project_entity_1.ProjectVisibility.PRIVATE,
            status: project_entity_1.ProjectStatus.CREATED,
        });
        const savedProject = await this.projectRepository.save(project);
        await this.auditLogService.record({
            actorUser: user,
            action: "PROJECT_CREATED",
            resourceType: "project",
            resourceId: savedProject.id,
            status: "success",
            metadata: {
                projectId: savedProject.id,
                projectName: savedProject.name,
                repositoryFullName: savedProject.repositoryFullName,
                targetBranch: savedProject.targetBranch,
            },
            req: req,
        });
        return this.toProjectResponse(savedProject, user);
    }
    async getProjectForView(user, projectId) {
        const project = await this.findProject(projectId);
        this.assertCanView(user, project);
        return this.toProjectResponse(project, user);
    }
    async getProjectEntityForView(user, projectId) {
        const project = await this.findProject(projectId);
        this.assertCanView(user, project);
        return project;
    }
    async getProjectEntityForManage(user, projectId) {
        const project = await this.findProject(projectId);
        this.assertCanManage(user, project);
        return project;
    }
    async updateProject(user, projectId, dto, req) {
        const project = await this.findProject(projectId);
        this.assertCanManage(user, project);
        if (dto.name !== undefined) {
            project.name = dto.name.trim();
        }
        if (dto.description !== undefined) {
            project.description = dto.description;
        }
        if (dto.visibility !== undefined) {
            project.visibility = dto.visibility;
        }
        const savedProject = await this.projectRepository.save(project);
        await this.auditLogService.record({
            actorUser: user,
            action: "PROJECT_UPDATED",
            resourceType: "project",
            resourceId: savedProject.id,
            status: "success",
            metadata: {
                projectId: savedProject.id,
                projectName: savedProject.name,
            },
            req: req,
        });
        return this.toProjectResponse(savedProject, user);
    }
    async archiveProject(user, projectId, req) {
        const project = await this.findProject(projectId);
        this.assertCanManage(user, project);
        project.status = project_entity_1.ProjectStatus.ARCHIVED;
        project.archivedAt = new Date();
        await this.projectRepository.save(project);
        await this.auditLogService.record({
            actorUser: user,
            action: "PROJECT_ARCHIVED",
            resourceType: "project",
            resourceId: project.id,
            status: "success",
            metadata: {
                projectId: project.id,
                projectName: project.name,
            },
            req: req,
        });
    }
    async updateRepository(user, projectId, dto, req) {
        const project = await this.findProject(projectId);
        this.assertCanManage(user, project);
        project.repositoryUrl = this.normalizeRepositoryUrl(dto.repositoryUrl);
        project.repositoryFullName = this.parseGitHubRepositoryFullName(dto.repositoryUrl);
        project.repositoryProvider = "github";
        project.status = project_entity_1.ProjectStatus.CONFIGURED;
        const savedProject = await this.projectRepository.save(project);
        await this.auditLogService.record({
            actorUser: user,
            action: "PROJECT_REPOSITORY_LINKED",
            resourceType: "project",
            resourceId: savedProject.id,
            status: "success",
            metadata: {
                projectId: savedProject.id,
                projectName: savedProject.name,
                repositoryFullName: savedProject.repositoryFullName,
            },
            req: req,
        });
        return this.toProjectResponse(savedProject, user);
    }
    async getBranches(user, projectId) {
        const project = await this.findProject(projectId);
        this.assertCanView(user, project);
        if (!project.repositoryFullName) {
            throw new common_1.BadRequestException("Project repository is not linked");
        }
        const response = await fetch(`https://api.github.com/repos/${project.repositoryFullName}/branches`, {
            headers: {
                Accept: "application/vnd.github+json",
                "User-Agent": "Deploy-Guard",
            },
        });
        if (!response.ok) {
            throw new common_1.BadRequestException("Unable to fetch GitHub branches");
        }
        const branches = (await response.json());
        return branches.map((branch) => branch.name).filter(Boolean);
    }
    async updateBranch(user, projectId, dto, req) {
        const project = await this.findProject(projectId);
        this.assertCanManage(user, project);
        project.targetBranch = dto.targetBranch;
        project.status = project_entity_1.ProjectStatus.CONFIGURED;
        const savedProject = await this.projectRepository.save(project);
        await this.auditLogService.record({
            actorUser: user,
            action: "PROJECT_BRANCH_UPDATED",
            resourceType: "project",
            resourceId: savedProject.id,
            status: "success",
            metadata: {
                projectId: savedProject.id,
                projectName: savedProject.name,
                targetBranch: savedProject.targetBranch,
            },
            req: req,
        });
        return this.toProjectResponse(savedProject, user);
    }
    async listEnvVars(user, projectId) {
        const project = await this.findProject(projectId);
        this.assertCanView(user, project);
        const variables = await this.envVarRepository.find({
            where: { projectId: project.id },
            order: { key: "ASC" },
        });
        return variables.map((variable) => this.toEnvVarResponse(variable));
    }
    async createEnvVar(user, projectId, dto, req) {
        const project = await this.findProject(projectId);
        this.assertCanManage(user, project);
        await this.assertEnvKeyAvailable(project.id, dto.key);
        const variable = this.envVarRepository.create({
            projectId: project.id,
            key: dto.key,
            value: dto.value,
            isSecret: dto.isSecret ?? true,
        });
        const savedVariable = await this.envVarRepository.save(variable);
        await this.auditLogService.record({
            actorUser: user,
            action: "PROJECT_ENV_CREATED",
            resourceType: "project_env",
            resourceId: savedVariable.id,
            status: "success",
            metadata: {
                projectId: project.id,
                projectName: project.name,
                key: savedVariable.key,
                isSecret: savedVariable.isSecret,
            },
            req: req,
        });
        return this.toEnvVarResponse(savedVariable);
    }
    async updateEnvVar(user, projectId, envId, dto, req) {
        const project = await this.findProject(projectId);
        this.assertCanManage(user, project);
        const variable = await this.findEnvVar(project.id, envId);
        if (dto.key && dto.key !== variable.key) {
            await this.assertEnvKeyAvailable(project.id, dto.key, variable.id);
            variable.key = dto.key;
        }
        if (dto.value !== undefined) {
            variable.value = dto.value;
        }
        if (dto.isSecret !== undefined) {
            variable.isSecret = dto.isSecret;
        }
        const savedVariable = await this.envVarRepository.save(variable);
        await this.auditLogService.record({
            actorUser: user,
            action: "PROJECT_ENV_UPDATED",
            resourceType: "project_env",
            resourceId: savedVariable.id,
            status: "success",
            metadata: {
                projectId: project.id,
                projectName: project.name,
                key: savedVariable.key,
                isSecret: savedVariable.isSecret,
            },
            req: req,
        });
        return this.toEnvVarResponse(savedVariable);
    }
    async deleteEnvVar(user, projectId, envId, req) {
        const project = await this.findProject(projectId);
        this.assertCanManage(user, project);
        const variable = await this.findEnvVar(project.id, envId);
        await this.envVarRepository.remove(variable);
        await this.auditLogService.record({
            actorUser: user,
            action: "PROJECT_ENV_DELETED",
            resourceType: "project_env",
            resourceId: envId,
            status: "success",
            metadata: {
                projectId: project.id,
                projectName: project.name,
                key: variable.key,
                isSecret: variable.isSecret,
            },
            req: req,
        });
    }
    async findProject(projectId) {
        const project = await this.projectRepository.findOne({ where: { id: projectId } });
        if (!project || project.status === project_entity_1.ProjectStatus.ARCHIVED) {
            throw new common_1.NotFoundException("Project not found");
        }
        return project;
    }
    async findEnvVar(projectId, envId) {
        const variable = await this.envVarRepository.findOne({
            where: { id: envId, projectId },
            select: {
                id: true,
                projectId: true,
                key: true,
                value: true,
                isSecret: true,
                createdAt: true,
                updatedAt: true,
            },
        });
        if (!variable) {
            throw new common_1.NotFoundException("Environment variable not found");
        }
        return variable;
    }
    assertCanWrite(user) {
        if (user.role === user_entity_1.UserRole.READONLY) {
            throw new common_1.ForbiddenException("Insufficient permissions");
        }
    }
    assertCanView(user, project) {
        if (user.role === user_entity_1.UserRole.ADMIN) {
            return;
        }
        if (project.ownerUserId === user.id) {
            return;
        }
        if (user.role === user_entity_1.UserRole.READONLY &&
            project.visibility === project_entity_1.ProjectVisibility.WORKSPACE) {
            return;
        }
        throw new common_1.ForbiddenException("Insufficient permissions");
    }
    assertCanManage(user, project) {
        this.assertCanWrite(user);
        if (user.role === user_entity_1.UserRole.ADMIN || project.ownerUserId === user.id) {
            return;
        }
        throw new common_1.ForbiddenException("Insufficient permissions");
    }
    async assertEnvKeyAvailable(projectId, key, currentEnvId) {
        const existing = await this.envVarRepository.findOne({ where: { projectId, key } });
        if (existing && existing.id !== currentEnvId) {
            throw new common_1.ConflictException("Environment variable key already exists");
        }
    }
    parseGitHubRepositoryFullName(repositoryUrl) {
        const match = this.normalizeRepositoryUrl(repositoryUrl).match(/^https:\/\/github\.com\/([^/\s]+\/[^/\s]+)$/);
        if (!match) {
            throw new common_1.BadRequestException("Invalid GitHub repository URL");
        }
        return match[1];
    }
    normalizeRepositoryUrl(repositoryUrl) {
        return repositoryUrl.trim().replace(/\/$/, "");
    }
    toProjectResponse(project, user) {
        return {
            id: project.id,
            ownerUserId: String(project.ownerUserId),
            name: project.name,
            description: project.description,
            repositoryUrl: project.repositoryUrl,
            repositoryProvider: project.repositoryProvider,
            repositoryFullName: project.repositoryFullName,
            targetBranch: project.targetBranch,
            status: project.status,
            visibility: project.visibility,
            canManage: user.role === user_entity_1.UserRole.ADMIN ||
                (user.role === user_entity_1.UserRole.DEVELOPER && project.ownerUserId === user.id),
            createdAt: project.createdAt,
            updatedAt: project.updatedAt,
        };
    }
    toEnvVarResponse(variable) {
        return {
            id: variable.id,
            key: variable.key,
            isSecret: variable.isSecret,
            maskedValue: "********",
            createdAt: variable.createdAt,
            updatedAt: variable.updatedAt,
        };
    }
};
exports.ProjectsService = ProjectsService;
exports.ProjectsService = ProjectsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(project_entity_1.Project)),
    __param(1, (0, typeorm_1.InjectRepository)(project_environment_variable_entity_1.ProjectEnvironmentVariable)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        audit_log_service_1.AuditLogService])
], ProjectsService);
//# sourceMappingURL=projects.service.js.map