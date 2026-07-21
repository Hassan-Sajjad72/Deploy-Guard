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
var _a, _b;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminController = void 0;
const common_1 = require("@nestjs/common");
const express_1 = require("express");
const audit_log_service_1 = require("../audit-log/audit-log.service");
const require_role_guard_1 = require("../common/rbac/require-role.guard");
const user_entity_1 = require("../users/user.entity");
const users_service_1 = require("../users/users.service");
const update_user_role_dto_1 = require("./dto/update-user-role.dto");
let AdminController = class AdminController {
    constructor(usersService, auditLogService) {
        this.usersService = usersService;
        this.auditLogService = auditLogService;
    }
    async listUsers(req) {
        const users = await this.usersService.findAll();
        await this.auditLogService.record({
            actorUser: req.user,
            action: "USER_LIST_VIEWED",
            resourceType: "user",
            status: "success",
            req,
        });
        return {
            users: users.map((user) => ({
                id: String(user.id),
                email: user.email,
                name: user.name,
                role: user.role,
                provider: user.githubId ? "github" : null,
                createdAt: user.createdAt,
            })),
        };
    }
    async updateUserRole(userId, dto, req) {
        const updatedUser = await this.usersService.updateRole(userId, dto.role);
        await this.auditLogService.record({
            actorUser: req.user,
            action: "USER_ROLE_UPDATED",
            resourceType: "user",
            resourceId: String(updatedUser.id),
            status: "success",
            metadata: {
                newRole: updatedUser.role,
            },
            req,
        });
        return {
            user: {
                id: String(updatedUser.id),
                email: updatedUser.email,
                name: updatedUser.name,
                role: updatedUser.role,
                provider: updatedUser.githubId ? "github" : null,
                createdAt: updatedUser.createdAt,
            },
        };
    }
};
exports.AdminController = AdminController;
__decorate([
    (0, common_1.Get)("users"),
    (0, common_1.UseGuards)((0, require_role_guard_1.requireRole)([user_entity_1.UserRole.ADMIN])),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_a = typeof express_1.Request !== "undefined" && express_1.Request) === "function" ? _a : Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "listUsers", null);
__decorate([
    (0, common_1.Patch)("users/:userId/role"),
    (0, common_1.UseGuards)((0, require_role_guard_1.requireRole)([user_entity_1.UserRole.ADMIN])),
    __param(0, (0, common_1.Param)("userId", common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_user_role_dto_1.UpdateUserRoleDto, typeof (_b = typeof express_1.Request !== "undefined" && express_1.Request) === "function" ? _b : Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "updateUserRole", null);
exports.AdminController = AdminController = __decorate([
    (0, common_1.Controller)("api/admin"),
    __metadata("design:paramtypes", [users_service_1.UsersService,
        audit_log_service_1.AuditLogService])
], AdminController);
//# sourceMappingURL=admin.controller.js.map