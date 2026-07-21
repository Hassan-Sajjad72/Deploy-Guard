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
var _a, _b, _c, _d, _e, _f, _g;
Object.defineProperty(exports, "__esModule", { value: true });
exports.InfrastructureController = void 0;
const common_1 = require("@nestjs/common");
const express_1 = require("express");
const require_role_guard_1 = require("../common/rbac/require-role.guard");
const user_entity_1 = require("../users/user.entity");
const infrastructure_service_1 = require("./infrastructure.service");
let InfrastructureController = class InfrastructureController {
    constructor(infrastructureService) {
        this.infrastructureService = infrastructureService;
    }
    async getDeploymentReadiness(req, projectId) {
        return this.infrastructureService.getDeploymentReadiness(req.user, projectId, req);
    }
    async deploy(req, projectId) {
        return this.infrastructureService.deploy(req.user, projectId, req);
    }
    async plan(req, projectId) {
        return this.infrastructureService.queuePlan(req.user, projectId, req);
    }
    async apply(req, projectId) {
        return this.infrastructureService.queueApply(req.user, projectId, req);
    }
    async getInfrastructure(req, projectId) {
        return {
            environment: await this.infrastructureService.getInfrastructureStatus(req.user, projectId),
        };
    }
    async getInfrastructureEvents(req, projectId) {
        return {
            events: await this.infrastructureService.getInfrastructureEvents(req.user, projectId),
        };
    }
    async getServiceDiscovery(req, projectId) {
        return {
            records: await this.infrastructureService.getServiceDiscoveryInfo(req.user, projectId),
        };
    }
};
exports.InfrastructureController = InfrastructureController;
__decorate([
    (0, common_1.Get)("deployment-readiness"),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)("projectId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_a = typeof express_1.Request !== "undefined" && express_1.Request) === "function" ? _a : Object, String]),
    __metadata("design:returntype", Promise)
], InfrastructureController.prototype, "getDeploymentReadiness", null);
__decorate([
    (0, common_1.Post)("deploy"),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)("projectId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_b = typeof express_1.Request !== "undefined" && express_1.Request) === "function" ? _b : Object, String]),
    __metadata("design:returntype", Promise)
], InfrastructureController.prototype, "deploy", null);
__decorate([
    (0, common_1.Post)("infrastructure/plan"),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)("projectId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_c = typeof express_1.Request !== "undefined" && express_1.Request) === "function" ? _c : Object, String]),
    __metadata("design:returntype", Promise)
], InfrastructureController.prototype, "plan", null);
__decorate([
    (0, common_1.Post)("infrastructure/apply"),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)("projectId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_d = typeof express_1.Request !== "undefined" && express_1.Request) === "function" ? _d : Object, String]),
    __metadata("design:returntype", Promise)
], InfrastructureController.prototype, "apply", null);
__decorate([
    (0, common_1.Get)("infrastructure"),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)("projectId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_e = typeof express_1.Request !== "undefined" && express_1.Request) === "function" ? _e : Object, String]),
    __metadata("design:returntype", Promise)
], InfrastructureController.prototype, "getInfrastructure", null);
__decorate([
    (0, common_1.Get)("infrastructure/events"),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)("projectId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_f = typeof express_1.Request !== "undefined" && express_1.Request) === "function" ? _f : Object, String]),
    __metadata("design:returntype", Promise)
], InfrastructureController.prototype, "getInfrastructureEvents", null);
__decorate([
    (0, common_1.Get)("service-discovery"),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)("projectId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_g = typeof express_1.Request !== "undefined" && express_1.Request) === "function" ? _g : Object, String]),
    __metadata("design:returntype", Promise)
], InfrastructureController.prototype, "getServiceDiscovery", null);
exports.InfrastructureController = InfrastructureController = __decorate([
    (0, common_1.Controller)("api/projects/:projectId"),
    (0, common_1.UseGuards)((0, require_role_guard_1.requireRole)([user_entity_1.UserRole.ADMIN, user_entity_1.UserRole.DEVELOPER, user_entity_1.UserRole.READONLY])),
    __metadata("design:paramtypes", [infrastructure_service_1.InfrastructureService])
], InfrastructureController);
//# sourceMappingURL=infrastructure.controller.js.map