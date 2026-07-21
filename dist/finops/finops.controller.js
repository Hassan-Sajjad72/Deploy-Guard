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
exports.FinopsController = void 0;
const common_1 = require("@nestjs/common");
const express_1 = require("express");
const require_role_guard_1 = require("../common/rbac/require-role.guard");
const user_entity_1 = require("../users/user.entity");
const finops_service_1 = require("./finops.service");
let FinopsController = class FinopsController {
    constructor(finopsService) {
        this.finopsService = finopsService;
    }
    async createEstimate(req, projectId) {
        return {
            estimate: await this.finopsService.createEstimate(req.user, projectId, req),
        };
    }
    async listEstimates(req, projectId) {
        return {
            estimates: await this.finopsService.listEstimates(req.user, projectId),
        };
    }
    async getLatestEstimate(req, projectId) {
        return {
            estimate: await this.finopsService.getLatestEstimate(req.user, projectId),
        };
    }
    async getEstimate(req, projectId, estimateId) {
        return {
            estimate: await this.finopsService.getEstimate(req.user, projectId, estimateId),
        };
    }
    async approveEstimate(req, projectId, estimateId) {
        return {
            estimate: await this.finopsService.approveEstimate(req.user, projectId, estimateId, req),
        };
    }
    async rejectEstimate(req, projectId, estimateId, dto) {
        return {
            estimate: await this.finopsService.rejectEstimate(req.user, projectId, estimateId, dto, req),
        };
    }
    async getSettings(req, projectId) {
        return {
            settings: await this.finopsService.getSettings(req.user, projectId),
        };
    }
    async updateSettings(req, projectId, dto) {
        return {
            settings: await this.finopsService.updateSettings(req.user, projectId, dto, req),
        };
    }
};
exports.FinopsController = FinopsController;
__decorate([
    (0, common_1.Post)("cost-estimates"),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)("projectId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_a = typeof express_1.Request !== "undefined" && express_1.Request) === "function" ? _a : Object, String]),
    __metadata("design:returntype", Promise)
], FinopsController.prototype, "createEstimate", null);
__decorate([
    (0, common_1.Get)("cost-estimates"),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)("projectId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_b = typeof express_1.Request !== "undefined" && express_1.Request) === "function" ? _b : Object, String]),
    __metadata("design:returntype", Promise)
], FinopsController.prototype, "listEstimates", null);
__decorate([
    (0, common_1.Get)("cost-estimates/latest"),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)("projectId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_c = typeof express_1.Request !== "undefined" && express_1.Request) === "function" ? _c : Object, String]),
    __metadata("design:returntype", Promise)
], FinopsController.prototype, "getLatestEstimate", null);
__decorate([
    (0, common_1.Get)("cost-estimates/:estimateId"),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)("projectId")),
    __param(2, (0, common_1.Param)("estimateId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_d = typeof express_1.Request !== "undefined" && express_1.Request) === "function" ? _d : Object, String, String]),
    __metadata("design:returntype", Promise)
], FinopsController.prototype, "getEstimate", null);
__decorate([
    (0, common_1.Post)("cost-estimates/:estimateId/approve"),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)("projectId")),
    __param(2, (0, common_1.Param)("estimateId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_e = typeof express_1.Request !== "undefined" && express_1.Request) === "function" ? _e : Object, String, String]),
    __metadata("design:returntype", Promise)
], FinopsController.prototype, "approveEstimate", null);
__decorate([
    (0, common_1.Post)("cost-estimates/:estimateId/reject"),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)("projectId")),
    __param(2, (0, common_1.Param)("estimateId")),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_f = typeof express_1.Request !== "undefined" && express_1.Request) === "function" ? _f : Object, String, String, Object]),
    __metadata("design:returntype", Promise)
], FinopsController.prototype, "rejectEstimate", null);
__decorate([
    (0, common_1.Get)("cost-settings"),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)("projectId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_g = typeof express_1.Request !== "undefined" && express_1.Request) === "function" ? _g : Object, String]),
    __metadata("design:returntype", Promise)
], FinopsController.prototype, "getSettings", null);
__decorate([
    (0, common_1.Patch)("cost-settings"),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)("projectId")),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_h = typeof express_1.Request !== "undefined" && express_1.Request) === "function" ? _h : Object, String, Object]),
    __metadata("design:returntype", Promise)
], FinopsController.prototype, "updateSettings", null);
exports.FinopsController = FinopsController = __decorate([
    (0, common_1.Controller)("api/projects/:projectId"),
    (0, common_1.UseGuards)((0, require_role_guard_1.requireRole)([user_entity_1.UserRole.ADMIN, user_entity_1.UserRole.DEVELOPER, user_entity_1.UserRole.READONLY])),
    __metadata("design:paramtypes", [finops_service_1.FinopsService])
], FinopsController);
//# sourceMappingURL=finops.controller.js.map