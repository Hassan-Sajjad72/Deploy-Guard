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
exports.StateManagementController = void 0;
const common_1 = require("@nestjs/common");
const express_1 = require("express");
const require_role_guard_1 = require("../common/rbac/require-role.guard");
const user_entity_1 = require("../users/user.entity");
const state_management_service_1 = require("./state-management.service");
let StateManagementController = class StateManagementController {
    constructor(stateManagementService) {
        this.stateManagementService = stateManagementService;
    }
    async getState(req, projectId) {
        return { state: await this.stateManagementService.getState(req.user, projectId) };
    }
    async getVersions(req, projectId) {
        return { versions: await this.stateManagementService.getVersions(req.user, projectId) };
    }
    async getLocks(req, projectId) {
        return this.stateManagementService.getLocks(req.user, projectId);
    }
    async getValidation(req, projectId) {
        return {
            results: await this.stateManagementService.getValidationResults(req.user, projectId),
        };
    }
    async validate(req, projectId) {
        return { result: await this.stateManagementService.validate(req.user, projectId) };
    }
    async recover(req, projectId, dto) {
        return { recovery: await this.stateManagementService.recover(req.user, projectId, dto) };
    }
    async forceRelease(req, projectId, lockId) {
        return {
            lock: await this.stateManagementService.forceRelease(req.user, projectId, lockId),
        };
    }
};
exports.StateManagementController = StateManagementController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)("projectId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_a = typeof express_1.Request !== "undefined" && express_1.Request) === "function" ? _a : Object, String]),
    __metadata("design:returntype", Promise)
], StateManagementController.prototype, "getState", null);
__decorate([
    (0, common_1.Get)("versions"),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)("projectId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_b = typeof express_1.Request !== "undefined" && express_1.Request) === "function" ? _b : Object, String]),
    __metadata("design:returntype", Promise)
], StateManagementController.prototype, "getVersions", null);
__decorate([
    (0, common_1.Get)("locks"),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)("projectId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_c = typeof express_1.Request !== "undefined" && express_1.Request) === "function" ? _c : Object, String]),
    __metadata("design:returntype", Promise)
], StateManagementController.prototype, "getLocks", null);
__decorate([
    (0, common_1.Get)("validation"),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)("projectId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_d = typeof express_1.Request !== "undefined" && express_1.Request) === "function" ? _d : Object, String]),
    __metadata("design:returntype", Promise)
], StateManagementController.prototype, "getValidation", null);
__decorate([
    (0, common_1.Post)("validate"),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)("projectId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_e = typeof express_1.Request !== "undefined" && express_1.Request) === "function" ? _e : Object, String]),
    __metadata("design:returntype", Promise)
], StateManagementController.prototype, "validate", null);
__decorate([
    (0, common_1.Post)("recover"),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)("projectId")),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_f = typeof express_1.Request !== "undefined" && express_1.Request) === "function" ? _f : Object, String, Object]),
    __metadata("design:returntype", Promise)
], StateManagementController.prototype, "recover", null);
__decorate([
    (0, common_1.Post)("locks/:lockId/force-release"),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)("projectId")),
    __param(2, (0, common_1.Param)("lockId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_g = typeof express_1.Request !== "undefined" && express_1.Request) === "function" ? _g : Object, String, String]),
    __metadata("design:returntype", Promise)
], StateManagementController.prototype, "forceRelease", null);
exports.StateManagementController = StateManagementController = __decorate([
    (0, common_1.Controller)("api/projects/:projectId/state"),
    (0, common_1.UseGuards)((0, require_role_guard_1.requireRole)([user_entity_1.UserRole.ADMIN, user_entity_1.UserRole.DEVELOPER, user_entity_1.UserRole.READONLY])),
    __metadata("design:paramtypes", [state_management_service_1.StateManagementService])
], StateManagementController);
//# sourceMappingURL=state-management.controller.js.map