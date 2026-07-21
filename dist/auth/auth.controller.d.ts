import { Request, Response } from "express";
import { AuditLogService } from "../audit-log/audit-log.service";
import { AuthService } from "./auth.service";
import { GitHubCallbackDto } from "./dto/github-callback.dto";
import { SignupDto } from "./dto/signup.dto";
import { LoginDto } from "./dto/login.dto";
export declare class AuthController {
    private readonly authService;
    private readonly auditLogService;
    constructor(authService: AuthService, auditLogService: AuditLogService);
    signup(dto: SignupDto, request: Request, response: Response): Promise<{
        user: {
            id: string;
            name: string;
            email: string;
            avatarUrl: string;
            role: import("../users/user.entity").UserRole;
        };
    }>;
    login(dto: LoginDto, request: Request, response: Response): Promise<{
        user: {
            id: string;
            name: string;
            email: string;
            avatarUrl: string;
            role: import("../users/user.entity").UserRole;
        };
    }>;
    me(request: Request): Promise<{
        user: {
            id: string;
            name: string;
            email: string;
            avatarUrl: string;
            role: import("../users/user.entity").UserRole;
        };
    }>;
    logout(request: Request, response: Response): Promise<{
        message: string;
    }>;
    github(request: Request, response: Response): Promise<any>;
    githubOAuthCallback(code: string, state: string, request: Request, response: Response): Promise<any>;
    githubCallback(dto: GitHubCallbackDto, request: Request): Promise<{
        success: boolean;
        isNewUser: boolean;
        userId: number;
        message: string;
    }>;
    private setSessionCookie;
    private cookieOptions;
    private getCookie;
    private safeAuthMetadata;
    private safeLegacyGithubCallbackMetadata;
}
