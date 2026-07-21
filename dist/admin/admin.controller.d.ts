import { Request } from "express";
import { AuditLogService } from "../audit-log/audit-log.service";
import { UserRole } from "../users/user.entity";
import { UsersService } from "../users/users.service";
import { UpdateUserRoleDto } from "./dto/update-user-role.dto";
export declare class AdminController {
    private readonly usersService;
    private readonly auditLogService;
    constructor(usersService: UsersService, auditLogService: AuditLogService);
    listUsers(req: Request): Promise<{
        users: {
            id: string;
            email: string;
            name: string;
            role: UserRole;
            provider: string;
            createdAt: Date;
        }[];
    }>;
    updateUserRole(userId: number, dto: UpdateUserRoleDto, req: Request): Promise<{
        user: {
            id: string;
            email: string;
            name: string;
            role: UserRole;
            provider: string;
            createdAt: Date;
        };
    }>;
}
