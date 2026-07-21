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
var _a, _b, _c, _d, _e, _f, _g, _h;
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrchestrationController = void 0;
const common_1 = require("@nestjs/common");
const express_1 = require("express");
const require_role_guard_1 = require("../common/rbac/require-role.guard");
const user_entity_1 = require("../users/user.entity");
const orchestration_service_1 = require("./orchestration.service");
let OrchestrationController = class OrchestrationController {
    constructor(orchestrationService) {
        this.orchestrationService = orchestrationService;
    }
    async deploy(req, projectId) {
        return this.orchestrationService.deploy(req.user, projectId, req);
    }
    async status(req, projectId) {
        return this.orchestrationService.getStatus(req.user, projectId);
    }
    async events(req, projectId) {
        return {
            events: await this.orchestrationService.getEvents(req.user, projectId),
        };
    }
    async releases(req, projectId) {
        return {
            releases: await this.orchestrationService.getReleases(req.user, projectId),
        };
    }
    async rollback(req, projectId, dto) {
        return this.orchestrationService.rollback(req.user, projectId, dto, req);
    }
    async targetHealth(req, projectId) {
        return {
            targetHealth: await this.orchestrationService.getTargetHealth(req.user, projectId),
        };
    }
    async scaling(req, projectId) {
        return {
            scaling: await this.orchestrationService.getScaling(req.user, projectId),
        };
    }
    async updateScaling(req, projectId, dto) {
        return {
            scaling: await this.orchestrationService.updateScaling(req.user, projectId, dto, req),
        };
    }
    async spotEvent(projectId, secret, event) {
        return {
            event: await this.orchestrationService.handleSpotEvent(projectId, event, secret || null),
        };
    }
};
exports.OrchestrationController = OrchestrationController;
__decorate([
    (0, common_1.Post)("deploy"),
    (0, common_1.UseGuards)((0, require_role_guard_1.requireRole)([user_entity_1.UserRole.ADMIN, user_entity_1.UserRole.DEVELOPER])),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)("projectId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_a = typeof express_1.Request !== "undefined" && express_1.Request) === "function" ? _a : Object, String]),
    __metadata("design:returntype", Promise)
], OrchestrationController.prototype, "deploy", null);
__decorate([
    (0, common_1.Get)("status"),
    (0, common_1.UseGuards)((0, require_role_guard_1.requireRole)([user_entity_1.UserRole.ADMIN, user_entity_1.UserRole.DEVELOPER, user_entity_1.UserRole.READONLY])),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)("projectId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_b = typeof express_1.Request !== "undefined" && express_1.Request) === "function" ? _b : Object, String]),
    __metadata("design:returntype", Promise)
], OrchestrationController.prototype, "status", null);
__decorate([
    (0, common_1.Get)("events"),
    (0, common_1.UseGuards)((0, require_role_guard_1.requireRole)([user_entity_1.UserRole.ADMIN, user_entity_1.UserRole.DEVELOPER, user_entity_1.UserRole.READONLY])),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)("projectId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_c = typeof express_1.Request !== "undefined" && express_1.Request) === "function" ? _c : Object, String]),
    __metadata("design:returntype", Promise)
], OrchestrationController.prototype, "events", null);
__decorate([
    (0, common_1.Get)("releases"),
    (0, common_1.UseGuards)((0, require_role_guard_1.requireRole)([user_entity_1.UserRole.ADMIN, user_entity_1.UserRole.DEVELOPER, user_entity_1.UserRole.READONLY])),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)("projectId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_d = typeof express_1.Request !== "undefined" && express_1.Request) === "function" ? _d : Object, String]),
    __metadata("design:returntype", Promise)
], OrchestrationController.prototype, "releases", null);
__decorate([
    (0, common_1.Post)("rollback"),
    (0, common_1.UseGuards)((0, require_role_guard_1.requireRole)([user_entity_1.UserRole.ADMIN, user_entity_1.UserRole.DEVELOPER])),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)("projectId")),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_e = typeof express_1.Request !== "undefined" && express_1.Request) === "function" ? _e : Object, String, Object]),
    __metadata("design:returntype", Promise)
], OrchestrationController.prototype, "rollback", null);
__decorate([
    (0, common_1.Get)("target-health"),
    (0, common_1.UseGuards)((0, require_role_guard_1.requireRole)([user_entity_1.UserRole.ADMIN, user_entity_1.UserRole.DEVELOPER, user_entity_1.UserRole.READONLY])),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)("projectId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_f = typeof express_1.Request !== "undefined" && express_1.Request) === "function" ? _f : Object, String]),
    __metadata("design:returntype", Promise)
], OrchestrationController.prototype, "targetHealth", null);
__decorate([
    (0, common_1.Get)("scaling"),
    (0, common_1.UseGuards)((0, require_role_guard_1.requireRole)([user_entity_1.UserRole.ADMIN, user_entity_1.UserRole.DEVELOPER, user_entity_1.UserRole.READONLY])),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)("projectId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_g = typeof express_1.Request !== "undefined" && express_1.Request) === "function" ? _g : Object, String]),
    __metadata("design:returntype", Promise)
], OrchestrationController.prototype, "scaling", null);
__decorate([
    (0, common_1.Patch)("scaling"),
    (0, common_1.UseGuards)((0, require_role_guard_1.requireRole)([user_entity_1.UserRole.ADMIN, user_entity_1.UserRole.DEVELOPER])),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)("projectId")),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_h = typeof express_1.Request !== "undefined" && express_1.Request) === "function" ? _h : Object, String, Object]),
    __metadata("design:returntype", Promise)
], OrchestrationController.prototype, "updateScaling", null);
__decorate([
    (0, common_1.Post)("spot-event"),
    __param(0, (0, common_1.Param)("projectId")),
    __param(1, (0, common_1.Headers)("x-deployguard-spot-secret")),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], OrchestrationController.prototype, "spotEvent", null);
exports.OrchestrationController = OrchestrationController = __decorate([
    (0, common_1.Controller)("api/projects/:projectId/orchestration"),
    __metadata("design:paramtypes", [orchestration_service_1.OrchestrationService])
], OrchestrationController);
//# sourceMappingURL=orchestration.controller.js.map