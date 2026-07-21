import { ConfigService } from "@nestjs/config";
import { UsersService } from "../users/users.service";
import { User } from "../users/user.entity";
import { GitHubCallbackDto } from "./dto/github-callback.dto";
import { SignupDto } from "./dto/signup.dto";
import { LoginDto } from "./dto/login.dto";
export declare const SESSION_COOKIE_NAME = "deploy_guard_session";
export declare const GITHUB_STATE_COOKIE_NAME = "deploy_guard_github_state";
export declare class AuthService {
    private readonly usersService;
    private readonly configService;
    private readonly logger;
    constructor(usersService: UsersService, configService: ConfigService);
    signup(dto: SignupDto): Promise<User>;
    login(dto: LoginDto): Promise<User>;
    getUserFromSessionToken(token?: string): Promise<User | null>;
    createSessionToken(user: User): string;
    getGithubAuthorizationUrl(state: string): string;
    handleGitHubOAuthCallback(code: string): Promise<User>;
    handleGitHubCallback(dto: GitHubCallbackDto): Promise<{
        success: boolean;
        isNewUser: boolean;
        userId: number;
        message: string;
    }>;
    toAuthUser(user: User): {
        id: string;
        name: string;
        email: string;
        avatarUrl: string;
        role: import("../users/user.entity").UserRole;
    };
    createOAuthState(): string;
    private hashPassword;
    private verifyPassword;
    private verifySessionToken;
    private sign;
    private isSameSignature;
    private base64UrlEncode;
    private getSessionSecret;
    private getGithubCallbackUrl;
}
