import { NestMiddleware } from "@nestjs/common";
import { NextFunction, Request, Response } from "express";
import { AuthService } from "../../auth/auth.service";
import { UsersService } from "../../users/users.service";
export declare class AuthenticatedUserMiddleware implements NestMiddleware {
    private readonly usersService;
    private readonly authService;
    constructor(usersService: UsersService, authService: AuthService);
    use(req: Request, _res: Response, next: NextFunction): Promise<any>;
    private getCookie;
}
