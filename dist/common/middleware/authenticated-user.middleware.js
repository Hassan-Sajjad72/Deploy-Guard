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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthenticatedUserMiddleware = void 0;
const common_1 = require("@nestjs/common");
const auth_service_1 = require("../../auth/auth.service");
const users_service_1 = require("../../users/users.service");
let AuthenticatedUserMiddleware = class AuthenticatedUserMiddleware {
    constructor(usersService, authService) {
        this.usersService = usersService;
        this.authService = authService;
    }
    async use(req, _res, next) {
        const sessionToken = this.getCookie(req, auth_service_1.SESSION_COOKIE_NAME);
        if (sessionToken) {
            req.user = await this.authService.getUserFromSessionToken(sessionToken);
            if (req.user) {
                return next();
            }
        }
        const userId = req.header("x-user-id");
        if (!userId) {
            return next();
        }
        const parsedUserId = Number(userId);
        if (!Number.isInteger(parsedUserId) || parsedUserId <= 0) {
            return next();
        }
        req.user = await this.usersService.findById(parsedUserId);
        return next();
    }
    getCookie(req, name) {
        const cookieHeader = req.headers.cookie;
        if (!cookieHeader) {
            return undefined;
        }
        return cookieHeader
            .split(";")
            .map((cookie) => cookie.trim())
            .find((cookie) => cookie.startsWith(`${name}=`))
            ?.split("=")[1];
    }
};
exports.AuthenticatedUserMiddleware = AuthenticatedUserMiddleware;
exports.AuthenticatedUserMiddleware = AuthenticatedUserMiddleware = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [users_service_1.UsersService,
        auth_service_1.AuthService])
], AuthenticatedUserMiddleware);
//# sourceMappingURL=authenticated-user.middleware.js.map