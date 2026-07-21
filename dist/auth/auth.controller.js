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
var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const express_1 = require("express");
const audit_log_service_1 = require("../audit-log/audit-log.service");
const auth_service_1 = require("./auth.service");
const auth_service_2 = require("./auth.service");
const github_callback_dto_1 = require("./dto/github-callback.dto");
const signup_dto_1 = require("./dto/signup.dto");
const login_dto_1 = require("./dto/login.dto");
let AuthController = class AuthController {
    constructor(authService, auditLogService) {
        this.authService = authService;
        this.auditLogService = auditLogService;
    }
    async signup(dto, request, response) {
        try {
            const user = await this.authService.signup(dto);
            this.setSessionCookie(response, this.authService.createSessionToken(user));
            await this.auditLogService.record({
                actorUser: user,
                action: "AUTH_SIGNUP_SUCCESS",
                resourceType: "auth",
                resourceId: user.id,
                status: "success",
                metadata: this.safeAuthMetadata(dto.email, "email"),
                req: request,
            });
            return {
                user: this.authService.toAuthUser(user),
            };
        }
        catch (error) {
            await this.auditLogService.record({
                action: "AUTH_SIGNUP_FAILED",
                resourceType: "auth",
                status: "failed",
                metadata: this.safeAuthMetadata(dto.email, "email"),
                req: request,
            });
            throw error;
        }
    }
    async login(dto, request, response) {
        try {
            const user = await this.authService.login(dto);
            this.setSessionCookie(response, this.authService.createSessionToken(user));
            await this.auditLogService.record({
                actorUser: user,
                action: "AUTH_LOGIN_SUCCESS",
                resourceType: "auth",
                resourceId: user.id,
                status: "success",
                metadata: this.safeAuthMetadata(dto.email, "email"),
                req: request,
            });
            return {
                user: this.authService.toAuthUser(user),
            };
        }
        catch (error) {
            await this.auditLogService.record({
                action: "AUTH_LOGIN_FAILED",
                resourceType: "auth",
                status: "failed",
                metadata: this.safeAuthMetadata(dto.email, "email"),
                req: request,
            });
            throw error;
        }
    }
    async me(request) {
        if (!request.user) {
            throw new common_1.UnauthorizedException("Authentication required");
        }
        return {
            user: this.authService.toAuthUser(request.user),
        };
    }
    async logout(request, response) {
        const sessionUser = await this.authService.getUserFromSessionToken(this.getCookie(request, auth_service_2.SESSION_COOKIE_NAME));
        response.clearCookie(auth_service_2.SESSION_COOKIE_NAME, this.cookieOptions());
        await this.auditLogService.record({
            actorUser: sessionUser,
            action: "AUTH_LOGOUT",
            resourceType: "auth",
            resourceId: sessionUser?.id,
            status: "success",
            metadata: { provider: sessionUser?.githubId ? "github" : "email" },
            req: request,
        });
        return {
            message: "Logged out successfully",
        };
    }
    async github(request, response) {
        try {
            const state = this.authService.createOAuthState();
            response.cookie(auth_service_2.GITHUB_STATE_COOKIE_NAME, state, {
                ...this.cookieOptions(),
                maxAge: 10 * 60 * 1000,
            });
            await this.auditLogService.record({
                action: "GITHUB_OAUTH_STARTED",
                resourceType: "auth",
                status: "success",
                metadata: { provider: "github" },
                req: request,
            });
            return response.redirect(this.authService.getGithubAuthorizationUrl(state));
        }
        catch (error) {
            await this.auditLogService.record({
                action: "GITHUB_OAUTH_FAILED",
                resourceType: "auth",
                status: "failed",
                metadata: { provider: "github", stage: "start" },
                req: request,
            });
            throw error;
        }
    }
    async githubOAuthCallback(code, state, request, response) {
        try {
            if (!code || !state || state !== this.getCookie(request, auth_service_2.GITHUB_STATE_COOKIE_NAME)) {
                throw new common_1.UnauthorizedException("Invalid GitHub OAuth state");
            }
            const user = await this.authService.handleGitHubOAuthCallback(code);
            this.setSessionCookie(response, this.authService.createSessionToken(user));
            response.clearCookie(auth_service_2.GITHUB_STATE_COOKIE_NAME, this.cookieOptions());
            await this.auditLogService.record({
                actorUser: user,
                action: "GITHUB_OAUTH_SUCCESS",
                resourceType: "auth",
                resourceId: user.id,
                status: "success",
                metadata: { provider: "github", userId: user.id },
                req: request,
            });
            const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
            return response.redirect(`${frontendUrl.replace(/\/$/, "")}/dashboard`);
        }
        catch (error) {
            await this.auditLogService.record({
                action: "GITHUB_OAUTH_FAILED",
                resourceType: "auth",
                status: "failed",
                metadata: { provider: "github", stage: "callback" },
                req: request,
            });
            throw error;
        }
    }
    async githubCallback(dto, request) {
        try {
            if (!dto.githubId) {
                throw new common_1.BadRequestException("githubId is required");
            }
            const result = await this.authService.handleGitHubCallback(dto);
            await this.auditLogService.record({
                action: "GITHUB_OAUTH_LEGACY_CALLBACK_SUCCESS",
                resourceType: "auth",
                resourceId: result.userId,
                status: "success",
                metadata: this.safeLegacyGithubCallbackMetadata(dto.email, result.userId, "success"),
                req: request,
            });
            return result;
        }
        catch (error) {
            await this.auditLogService.record({
                action: "GITHUB_OAUTH_LEGACY_CALLBACK_FAILED",
                resourceType: "auth",
                status: "failed",
                metadata: this.safeLegacyGithubCallbackMetadata(dto.email, undefined, "failed"),
                req: request,
            });
            throw error;
        }
    }
    setSessionCookie(response, token) {
        response.cookie(auth_service_2.SESSION_COOKIE_NAME, token, {
            ...this.cookieOptions(),
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });
    }
    cookieOptions() {
        return {
            httpOnly: true,
            sameSite: "lax",
            secure: process.env.NODE_ENV === "production",
            path: "/",
        };
    }
    getCookie(request, name) {
        const cookieHeader = request.headers.cookie;
        if (!cookieHeader) {
            return undefined;
        }
        return cookieHeader
            .split(";")
            .map((cookie) => cookie.trim())
            .find((cookie) => cookie.startsWith(`${name}=`))
            ?.split("=")[1];
    }
    safeAuthMetadata(email, provider) {
        const domain = email?.includes("@") ? email.split("@").pop()?.toLowerCase() : null;
        return {
            provider,
            emailDomain: domain || null,
        };
    }
    safeLegacyGithubCallbackMetadata(email, userId, status) {
        return {
            provider: "github",
            routeType: "legacy_post_callback",
            userId,
            emailDomain: email?.includes("@") ? email.split("@").pop()?.toLowerCase() : null,
            status,
        };
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, common_1.Post)("signup"),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [signup_dto_1.SignupDto, typeof (_a = typeof express_1.Request !== "undefined" && express_1.Request) === "function" ? _a : Object, typeof (_b = typeof express_1.Response !== "undefined" && express_1.Response) === "function" ? _b : Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "signup", null);
__decorate([
    (0, common_1.Post)("login"),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [login_dto_1.LoginDto, typeof (_c = typeof express_1.Request !== "undefined" && express_1.Request) === "function" ? _c : Object, typeof (_d = typeof express_1.Response !== "undefined" && express_1.Response) === "function" ? _d : Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "login", null);
__decorate([
    (0, common_1.Get)("me"),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_e = typeof express_1.Request !== "undefined" && express_1.Request) === "function" ? _e : Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "me", null);
__decorate([
    (0, common_1.Post)("logout"),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_f = typeof express_1.Request !== "undefined" && express_1.Request) === "function" ? _f : Object, typeof (_g = typeof express_1.Response !== "undefined" && express_1.Response) === "function" ? _g : Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "logout", null);
__decorate([
    (0, common_1.Get)("github"),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_h = typeof express_1.Request !== "undefined" && express_1.Request) === "function" ? _h : Object, typeof (_j = typeof express_1.Response !== "undefined" && express_1.Response) === "function" ? _j : Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "github", null);
__decorate([
    (0, common_1.Get)("github/callback"),
    __param(0, (0, common_1.Query)("code")),
    __param(1, (0, common_1.Query)("state")),
    __param(2, (0, common_1.Req)()),
    __param(3, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, typeof (_k = typeof express_1.Request !== "undefined" && express_1.Request) === "function" ? _k : Object, typeof (_l = typeof express_1.Response !== "undefined" && express_1.Response) === "function" ? _l : Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "githubOAuthCallback", null);
__decorate([
    (0, common_1.Post)("github/callback"),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [github_callback_dto_1.GitHubCallbackDto, typeof (_m = typeof express_1.Request !== "undefined" && express_1.Request) === "function" ? _m : Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "githubCallback", null);
exports.AuthController = AuthController = __decorate([
    (0, common_1.Controller)(["auth", "api/auth"]),
    __metadata("design:paramtypes", [auth_service_1.AuthService,
        audit_log_service_1.AuditLogService])
], AuthController);
//# sourceMappingURL=auth.controller.js.map