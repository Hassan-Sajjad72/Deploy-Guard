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
var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectsController = void 0;
const common_1 = require("@nestjs/common");
const express_1 = require("express");
const require_role_guard_1 = require("../common/rbac/require-role.guard");
const user_entity_1 = require("../users/user.entity");
const create_env_var_dto_1 = require("./dto/create-env-var.dto");
const create_project_dto_1 = require("./dto/create-project.dto");
const update_branch_dto_1 = require("./dto/update-branch.dto");
const update_env_var_dto_1 = require("./dto/update-env-var.dto");
const update_project_dto_1 = require("./dto/update-project.dto");
const update_repository_dto_1 = require("./dto/update-repository.dto");
const projects_service_1 = require("./projects.service");
const deployment_profile_service_1 = require("./detection/deployment-profile.service");
const preflight_service_1 = require("./templates/preflight.service");
const start_pipeline_run_dto_1 = require("./dto/start-pipeline-run.dto");
const pipeline_service_1 = require("./pipeline/pipeline.service");
const start_security_scan_dto_1 = require("./dto/start-security-scan.dto");
const approve_security_scan_dto_1 = require("./dto/approve-security-scan.dto");
const security_scan_service_1 = require("./security/security-scan.service");
let ProjectsController = class ProjectsController {
    constructor(projectsService, deploymentProfileService, preflightService, pipelineService, securityScanService) {
        this.projectsService = projectsService;
        this.deploymentProfileService = deploymentProfileService;
        this.preflightService = preflightService;
        this.pipelineService = pipelineService;
        this.securityScanService = securityScanService;
    }
    async listProjects(req) {
        return { projects: await this.projectsService.listProjects(req.user) };
    }
    async createProject(req, dto) {
        return {
            project: await this.projectsService.createProject(req.user, dto, req),
        };
    }
    async detectStack(req, projectId) {
        return {
            profile: await this.deploymentProfileService.runDetection(req.user, projectId, req),
        };
    }
    async getDetectionProfile(req, projectId) {
        return {
            profile: await this.deploymentProfileService.getProfile(req.user, projectId),
        };
    }
    async generatePreflight(req, projectId) {
        return {
            report: await this.preflightService.generateReport(req.user, projectId, req),
        };
    }
    async getPreflight(req, projectId) {
        return {
            report: await this.preflightService.getReport(req.user, projectId),
        };
    }
    async startPipelineRun(req, projectId, dto) {
        return {
            pipelineRun: await this.pipelineService.startRun(req.user, projectId, dto, req),
        };
    }
    async listPipelineRuns(req, projectId) {
        return {
            pipelineRuns: await this.pipelineService.listRuns(req.user, projectId),
        };
    }
    async getPipelineRun(req, projectId, runId) {
        return {
            pipelineRun: await this.pipelineService.getRun(req.user, projectId, runId),
        };
    }
    async listPipelineEvents(req, projectId, runId) {
        return {
            events: await this.pipelineService.listEvents(req.user, projectId, runId),
        };
    }
    async triggerSecurityScan(req, projectId, dto) {
        return {
            scan: await this.securityScanService.triggerScan(req.user, projectId, dto, req),
        };
    }
    async listSecurityScans(req, projectId) {
        return {
            scans: await this.securityScanService.listScans(req.user, projectId),
        };
    }
    async getSecurityScan(req, projectId, scanId) {
        return {
            scan: await this.securityScanService.getScan(req.user, projectId, scanId),
        };
    }
    async listSecurityFindings(req, projectId, scanId, query) {
        return this.securityScanService.listFindings(req.user, projectId, scanId, query);
    }
    async approveSecurityScan(req, projectId, scanId, dto) {
        return {
            scan: await this.securityScanService.approveScan(req.user, projectId, scanId, dto, req),
        };
    }
    async getProject(req, projectId) {
        return {
            project: await this.projectsService.getProjectForView(req.user, projectId),
        };
    }
    async updateProject(req, projectId, dto) {
        return {
            project: await this.projectsService.updateProject(req.user, projectId, dto, req),
        };
    }
    async archiveProject(req, projectId) {
        await this.projectsService.archiveProject(req.user, projectId, req);
        return { message: "Project archived successfully" };
    }
    async updateRepository(req, projectId, dto) {
        return {
            project: await this.projectsService.updateRepository(req.user, projectId, dto, req),
        };
    }
    async getBranches(req, projectId) {
        return {
            branches: await this.projectsService.getBranches(req.user, projectId),
        };
    }
    async updateBranch(req, projectId, dto) {
        return {
            project: await this.projectsService.updateBranch(req.user, projectId, dto, req),
        };
    }
    async listEnvVars(req, projectId) {
        return {
            variables: await this.projectsService.listEnvVars(req.user, projectId),
        };
    }
    async createEnvVar(req, projectId, dto) {
        return {
            variable: await this.projectsService.createEnvVar(req.user, projectId, dto, req),
        };
    }
    async updateEnvVar(req, projectId, envId, dto) {
        return {
            variable: await this.projectsService.updateEnvVar(req.user, projectId, envId, dto, req),
        };
    }
    async deleteEnvVar(req, projectId, envId) {
        await this.projectsService.deleteEnvVar(req.user, projectId, envId, req);
        return { message: "Environment variable deleted successfully" };
    }
};
exports.ProjectsController = ProjectsController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_a = typeof express_1.Request !== "undefined" && express_1.Request) === "function" ? _a : Object]),
    __metadata("design:returntype", Promise)
], ProjectsController.prototype, "listProjects", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_b = typeof express_1.Request !== "undefined" && express_1.Request) === "function" ? _b : Object, create_project_dto_1.CreateProjectDto]),
    __metadata("design:returntype", Promise)
], ProjectsController.prototype, "createProject", null);
__decorate([
    (0, common_1.Post)(":projectId/detect-stack"),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)("projectId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_c = typeof express_1.Request !== "undefined" && express_1.Request) === "function" ? _c : Object, String]),
    __metadata("design:returntype", Promise)
], ProjectsController.prototype, "detectStack", null);
__decorate([
    (0, common_1.Get)(":projectId/detection-profile"),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)("projectId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_d = typeof express_1.Request !== "undefined" && express_1.Request) === "function" ? _d : Object, String]),
    __metadata("design:returntype", Promise)
], ProjectsController.prototype, "getDetectionProfile", null);
__decorate([
    (0, common_1.Post)(":projectId/preflight"),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)("projectId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_e = typeof express_1.Request !== "undefined" && express_1.Request) === "function" ? _e : Object, String]),
    __metadata("design:returntype", Promise)
], ProjectsController.prototype, "generatePreflight", null);
__decorate([
    (0, common_1.Get)(":projectId/preflight"),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)("projectId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_f = typeof express_1.Request !== "undefined" && express_1.Request) === "function" ? _f : Object, String]),
    __metadata("design:returntype", Promise)
], ProjectsController.prototype, "getPreflight", null);
__decorate([
    (0, common_1.Post)(":projectId/pipeline/runs"),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)("projectId")),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_g = typeof express_1.Request !== "undefined" && express_1.Request) === "function" ? _g : Object, String, start_pipeline_run_dto_1.StartPipelineRunDto]),
    __metadata("design:returntype", Promise)
], ProjectsController.prototype, "startPipelineRun", null);
__decorate([
    (0, common_1.Get)(":projectId/pipeline/runs"),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)("projectId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_h = typeof express_1.Request !== "undefined" && express_1.Request) === "function" ? _h : Object, String]),
    __metadata("design:returntype", Promise)
], ProjectsController.prototype, "listPipelineRuns", null);
__decorate([
    (0, common_1.Get)(":projectId/pipeline/runs/:runId"),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)("projectId")),
    __param(2, (0, common_1.Param)("runId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_j = typeof express_1.Request !== "undefined" && express_1.Request) === "function" ? _j : Object, String, String]),
    __metadata("design:returntype", Promise)
], ProjectsController.prototype, "getPipelineRun", null);
__decorate([
    (0, common_1.Get)(":projectId/pipeline/runs/:runId/events"),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)("projectId")),
    __param(2, (0, common_1.Param)("runId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_k = typeof express_1.Request !== "undefined" && express_1.Request) === "function" ? _k : Object, String, String]),
    __metadata("design:returntype", Promise)
], ProjectsController.prototype, "listPipelineEvents", null);
__decorate([
    (0, common_1.Post)(":projectId/security-scans"),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)("projectId")),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_l = typeof express_1.Request !== "undefined" && express_1.Request) === "function" ? _l : Object, String, start_security_scan_dto_1.StartSecurityScanDto]),
    __metadata("design:returntype", Promise)
], ProjectsController.prototype, "triggerSecurityScan", null);
__decorate([
    (0, common_1.Get)(":projectId/security-scans"),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)("projectId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_m = typeof express_1.Request !== "undefined" && express_1.Request) === "function" ? _m : Object, String]),
    __metadata("design:returntype", Promise)
], ProjectsController.prototype, "listSecurityScans", null);
__decorate([
    (0, common_1.Get)(":projectId/security-scans/:scanId"),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)("projectId")),
    __param(2, (0, common_1.Param)("scanId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_o = typeof express_1.Request !== "undefined" && express_1.Request) === "function" ? _o : Object, String, String]),
    __metadata("design:returntype", Promise)
], ProjectsController.prototype, "getSecurityScan", null);
__decorate([
    (0, common_1.Get)(":projectId/security-scans/:scanId/findings"),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)("projectId")),
    __param(2, (0, common_1.Param)("scanId")),
    __param(3, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_p = typeof express_1.Request !== "undefined" && express_1.Request) === "function" ? _p : Object, String, String, Object]),
    __metadata("design:returntype", Promise)
], ProjectsController.prototype, "listSecurityFindings", null);
__decorate([
    (0, common_1.Post)(":projectId/security-scans/:scanId/approve"),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)("projectId")),
    __param(2, (0, common_1.Param)("scanId")),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_q = typeof express_1.Request !== "undefined" && express_1.Request) === "function" ? _q : Object, String, String, approve_security_scan_dto_1.ApproveSecurityScanDto]),
    __metadata("design:returntype", Promise)
], ProjectsController.prototype, "approveSecurityScan", null);
__decorate([
    (0, common_1.Get)(":projectId"),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)("projectId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_r = typeof express_1.Request !== "undefined" && express_1.Request) === "function" ? _r : Object, String]),
    __metadata("design:returntype", Promise)
], ProjectsController.prototype, "getProject", null);
__decorate([
    (0, common_1.Patch)(":projectId"),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)("projectId")),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_s = typeof express_1.Request !== "undefined" && express_1.Request) === "function" ? _s : Object, String, update_project_dto_1.UpdateProjectDto]),
    __metadata("design:returntype", Promise)
], ProjectsController.prototype, "updateProject", null);
__decorate([
    (0, common_1.Delete)(":projectId"),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)("projectId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_t = typeof express_1.Request !== "undefined" && express_1.Request) === "function" ? _t : Object, String]),
    __metadata("design:returntype", Promise)
], ProjectsController.prototype, "archiveProject", null);
__decorate([
    (0, common_1.Patch)(":projectId/repository"),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)("projectId")),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_u = typeof express_1.Request !== "undefined" && express_1.Request) === "function" ? _u : Object, String, update_repository_dto_1.UpdateRepositoryDto]),
    __metadata("design:returntype", Promise)
], ProjectsController.prototype, "updateRepository", null);
__decorate([
    (0, common_1.Get)(":projectId/branches"),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)("projectId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_v = typeof express_1.Request !== "undefined" && express_1.Request) === "function" ? _v : Object, String]),
    __metadata("design:returntype", Promise)
], ProjectsController.prototype, "getBranches", null);
__decorate([
    (0, common_1.Patch)(":projectId/branch"),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)("projectId")),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_w = typeof express_1.Request !== "undefined" && express_1.Request) === "function" ? _w : Object, String, update_branch_dto_1.UpdateBranchDto]),
    __metadata("design:returntype", Promise)
], ProjectsController.prototype, "updateBranch", null);
__decorate([
    (0, common_1.Get)(":projectId/env"),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)("projectId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_x = typeof express_1.Request !== "undefined" && express_1.Request) === "function" ? _x : Object, String]),
    __metadata("design:returntype", Promise)
], ProjectsController.prototype, "listEnvVars", null);
__decorate([
    (0, common_1.Post)(":projectId/env"),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)("projectId")),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_y = typeof express_1.Request !== "undefined" && express_1.Request) === "function" ? _y : Object, String, create_env_var_dto_1.CreateEnvVarDto]),
    __metadata("design:returntype", Promise)
], ProjectsController.prototype, "createEnvVar", null);
__decorate([
    (0, common_1.Patch)(":projectId/env/:envId"),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)("projectId")),
    __param(2, (0, common_1.Param)("envId")),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_z = typeof express_1.Request !== "undefined" && express_1.Request) === "function" ? _z : Object, String, String, update_env_var_dto_1.UpdateEnvVarDto]),
    __metadata("design:returntype", Promise)
], ProjectsController.prototype, "updateEnvVar", null);
__decorate([
    (0, common_1.Delete)(":projectId/env/:envId"),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)("projectId")),
    __param(2, (0, common_1.Param)("envId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_0 = typeof express_1.Request !== "undefined" && express_1.Request) === "function" ? _0 : Object, String, String]),
    __metadata("design:returntype", Promise)
], ProjectsController.prototype, "deleteEnvVar", null);
exports.ProjectsController = ProjectsController = __decorate([
    (0, common_1.Controller)("api/projects"),
    (0, common_1.UseGuards)((0, require_role_guard_1.requireRole)([user_entity_1.UserRole.ADMIN, user_entity_1.UserRole.DEVELOPER, user_entity_1.UserRole.READONLY])),
    __metadata("design:paramtypes", [projects_service_1.ProjectsService,
        deployment_profile_service_1.DeploymentProfileService,
        preflight_service_1.PreflightService,
        pipeline_service_1.PipelineService,
        security_scan_service_1.SecurityScanService])
], ProjectsController);
//# sourceMappingURL=projects.controller.js.map