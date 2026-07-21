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
var AuthService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = exports.GITHUB_STATE_COOKIE_NAME = exports.SESSION_COOKIE_NAME = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const crypto_1 = require("crypto");
const users_service_1 = require("../users/users.service");
exports.SESSION_COOKIE_NAME = "deploy_guard_session";
exports.GITHUB_STATE_COOKIE_NAME = "deploy_guard_github_state";
let AuthService = AuthService_1 = class AuthService {
    constructor(usersService, configService) {
        this.usersService = usersService;
        this.configService = configService;
        this.logger = new common_1.Logger(AuthService_1.name);
    }
    async signup(dto) {
        const passwordHash = this.hashPassword(dto.password);
        return this.usersService.createWithPassword({
            name: dto.name.trim(),
            email: dto.email.toLowerCase(),
            passwordHash,
        });
    }
    async login(dto) {
        const user = await this.usersService.findByEmailWithPassword(dto.email);
        if (!user?.passwordHash || !this.verifyPassword(dto.password, user.passwordHash)) {
            throw new common_1.UnauthorizedException("Invalid email or password");
        }
        return this.usersService.markLoggedIn(user);
    }
    async getUserFromSessionToken(token) {
        const payload = this.verifySessionToken(token);
        if (!payload) {
            return null;
        }
        return this.usersService.findById(payload.sub);
    }
    createSessionToken(user) {
        const now = Math.floor(Date.now() / 1000);
        const payload = {
            sub: user.id,
            iat: now,
            exp: now + 7 * 24 * 60 * 60,
        };
        const encodedPayload = this.base64UrlEncode(JSON.stringify(payload));
        const signature = this.sign(encodedPayload);
        return `${encodedPayload}.${signature}`;
    }
    getGithubAuthorizationUrl(state) {
        const clientId = this.configService.get("GITHUB_CLIENT_ID");
        if (!clientId) {
            throw new common_1.BadRequestException("GitHub OAuth is not configured");
        }
        const callbackUrl = this.getGithubCallbackUrl();
        const params = new URLSearchParams({
            client_id: clientId,
            redirect_uri: callbackUrl,
            scope: "read:user user:email",
            state,
        });
        return `https://github.com/login/oauth/authorize?${params.toString()}`;
    }
    async handleGitHubOAuthCallback(code) {
        const clientId = this.configService.get("GITHUB_CLIENT_ID");
        const clientSecret = this.configService.get("GITHUB_CLIENT_SECRET");
        if (!clientId || !clientSecret) {
            throw new common_1.BadRequestException("GitHub OAuth is not configured");
        }
        const tokenResponse = await fetch("https://github.com/login/oauth/access_token", {
            method: "POST",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                client_id: clientId,
                client_secret: clientSecret,
                code,
                redirect_uri: this.getGithubCallbackUrl(),
            }),
        });
        const tokenPayload = await tokenResponse.json();
        const accessToken = tokenPayload?.access_token;
        if (!accessToken) {
            throw new common_1.UnauthorizedException("GitHub OAuth failed");
        }
        const profileResponse = await fetch("https://api.github.com/user", {
            headers: {
                Authorization: `Bearer ${accessToken}`,
                Accept: "application/vnd.github+json",
            },
        });
        const profile = await profileResponse.json();
        const emailsResponse = await fetch("https://api.github.com/user/emails", {
            headers: {
                Authorization: `Bearer ${accessToken}`,
                Accept: "application/vnd.github+json",
            },
        });
        const emails = emailsResponse.ok ? await emailsResponse.json() : [];
        const primaryEmail = emails.find((email) => email.primary)
            ?.email ||
            profile.email ||
            "";
        const { user } = await this.usersService.findOrCreate({
            githubId: String(profile.id),
            name: profile.name || profile.login || "",
            email: primaryEmail,
            image: profile.avatar_url || "",
            login: profile.login || "",
        });
        return user;
    }
    async handleGitHubCallback(dto) {
        this.logger.log(`GitHub sign-in: githubId=${dto.githubId}, login=${dto.login}`);
        const { user, isNewUser } = await this.usersService.findOrCreate({
            githubId: String(dto.githubId),
            name: dto.name || "",
            email: dto.email || "",
            image: dto.image || "",
            login: dto.login || "",
        });
        if (isNewUser) {
            this.logger.log(`New user created: id=${user.id}, login=${user.githubLogin}`);
        }
        else {
            this.logger.log(`Existing user updated: id=${user.id}, login=${user.githubLogin}`);
        }
        return {
            success: true,
            isNewUser,
            userId: user.id,
            message: isNewUser ? "Account created successfully" : "Welcome back!",
        };
    }
    toAuthUser(user) {
        return {
            id: String(user.id),
            name: user.name,
            email: user.email,
            avatarUrl: user.image,
            role: user.role,
        };
    }
    createOAuthState() {
        return (0, crypto_1.randomBytes)(24).toString("hex");
    }
    hashPassword(password) {
        const iterations = 120000;
        const salt = (0, crypto_1.randomBytes)(16).toString("hex");
        const hash = (0, crypto_1.pbkdf2Sync)(password, salt, iterations, 32, "sha256").toString("hex");
        return `pbkdf2$${iterations}$${salt}$${hash}`;
    }
    verifyPassword(password, storedHash) {
        const [algorithm, iterationsValue, salt, expectedHash] = storedHash.split("$");
        if (algorithm !== "pbkdf2" || !iterationsValue || !salt || !expectedHash) {
            return false;
        }
        const hash = (0, crypto_1.pbkdf2Sync)(password, salt, Number(iterationsValue), 32, "sha256");
        const expected = Buffer.from(expectedHash, "hex");
        return expected.length === hash.length && (0, crypto_1.timingSafeEqual)(expected, hash);
    }
    verifySessionToken(token) {
        if (!token) {
            return null;
        }
        const [encodedPayload, signature] = token.split(".");
        if (!encodedPayload ||
            !signature ||
            !this.isSameSignature(this.sign(encodedPayload), signature)) {
            return null;
        }
        try {
            const payload = JSON.parse(Buffer.from(encodedPayload, "base64url").toString("utf8"));
            if (!payload.sub || payload.exp < Math.floor(Date.now() / 1000)) {
                return null;
            }
            return payload;
        }
        catch {
            return null;
        }
    }
    sign(value) {
        return (0, crypto_1.createHmac)("sha256", this.getSessionSecret())
            .update(value)
            .digest("base64url");
    }
    isSameSignature(expected, actual) {
        const expectedBuffer = Buffer.from(expected);
        const actualBuffer = Buffer.from(actual);
        return (expectedBuffer.length === actualBuffer.length &&
            (0, crypto_1.timingSafeEqual)(expectedBuffer, actualBuffer));
    }
    base64UrlEncode(value) {
        return Buffer.from(value).toString("base64url");
    }
    getSessionSecret() {
        return (this.configService.get("AUTH_SESSION_SECRET") ||
            "development-only-change-me");
    }
    getGithubCallbackUrl() {
        return (this.configService.get("GITHUB_CALLBACK_URL") ||
            "http://localhost:5000/api/auth/github/callback");
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = AuthService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [users_service_1.UsersService,
        config_1.ConfigService])
], AuthService);
//# sourceMappingURL=auth.service.js.map