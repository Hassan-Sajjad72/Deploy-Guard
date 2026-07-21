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
exports.StorageController = void 0;
const common_1 = require("@nestjs/common");
const express_1 = require("express");
const require_role_guard_1 = require("../common/rbac/require-role.guard");
const user_entity_1 = require("../users/user.entity");
const storage_service_1 = require("./storage.service");
let StorageController = class StorageController {
    constructor(storageService) {
        this.storageService = storageService;
    }
    async getRecommendation(req, projectId) {
        return {
            recommendation: await this.storageService.getRecommendation(req.user, projectId),
        };
    }
    async getStorage(req, projectId) {
        return {
            storage: await this.storageService.getStorage(req.user, projectId),
        };
    }
    async updateSettings(req, projectId, dto) {
        return {
            storage: await this.storageService.updateSettings(req.user, projectId, dto, req),
        };
    }
    async provision(req, projectId) {
        return this.storageService.provision(req.user, projectId, req);
    }
    async getEvents(req, projectId) {
        return {
            events: await this.storageService.getEvents(req.user, projectId),
        };
    }
    async getMountConfig(req, projectId) {
        return {
            mountConfig: await this.storageService.getMountConfig(req.user, projectId),
        };
    }
    async getBackups(req, projectId) {
        return {
            backups: await this.storageService.getBackups(req.user, projectId),
        };
    }
    async createRestoreRequest(req, projectId, dto) {
        return {
            restoreRequest: await this.storageService.createRestoreRequest(req.user, projectId, dto, req),
        };
    }
};
exports.StorageController = StorageController;
__decorate([
    (0, common_1.Get)("storage/recommendation"),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)("projectId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_a = typeof express_1.Request !== "undefined" && express_1.Request) === "function" ? _a : Object, String]),
    __metadata("design:returntype", Promise)
], StorageController.prototype, "getRecommendation", null);
__decorate([
    (0, common_1.Get)("storage"),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)("projectId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_b = typeof express_1.Request !== "undefined" && express_1.Request) === "function" ? _b : Object, String]),
    __metadata("design:returntype", Promise)
], StorageController.prototype, "getStorage", null);
__decorate([
    (0, common_1.Patch)("storage/settings"),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)("projectId")),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_c = typeof express_1.Request !== "undefined" && express_1.Request) === "function" ? _c : Object, String, Object]),
    __metadata("design:returntype", Promise)
], StorageController.prototype, "updateSettings", null);
__decorate([
    (0, common_1.Post)("storage/provision"),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)("projectId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_d = typeof express_1.Request !== "undefined" && express_1.Request) === "function" ? _d : Object, String]),
    __metadata("design:returntype", Promise)
], StorageController.prototype, "provision", null);
__decorate([
    (0, common_1.Get)("storage/events"),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)("projectId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_e = typeof express_1.Request !== "undefined" && express_1.Request) === "function" ? _e : Object, String]),
    __metadata("design:returntype", Promise)
], StorageController.prototype, "getEvents", null);
__decorate([
    (0, common_1.Get)("storage/mount-config"),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)("projectId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_f = typeof express_1.Request !== "undefined" && express_1.Request) === "function" ? _f : Object, String]),
    __metadata("design:returntype", Promise)
], StorageController.prototype, "getMountConfig", null);
__decorate([
    (0, common_1.Get)("backups"),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)("projectId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_g = typeof express_1.Request !== "undefined" && express_1.Request) === "function" ? _g : Object, String]),
    __metadata("design:returntype", Promise)
], StorageController.prototype, "getBackups", null);
__decorate([
    (0, common_1.Post)("backups/restore-request"),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)("projectId")),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_h = typeof express_1.Request !== "undefined" && express_1.Request) === "function" ? _h : Object, String, Object]),
    __metadata("design:returntype", Promise)
], StorageController.prototype, "createRestoreRequest", null);
exports.StorageController = StorageController = __decorate([
    (0, common_1.Controller)("api/projects/:projectId"),
    (0, common_1.UseGuards)((0, require_role_guard_1.requireRole)([user_entity_1.UserRole.ADMIN, user_entity_1.UserRole.DEVELOPER, user_entity_1.UserRole.READONLY])),
    __metadata("design:paramtypes", [storage_service_1.StorageService])
], StorageController);
//# sourceMappingURL=storage.controller.js.map