import { CanActivate, Type } from "@nestjs/common";
import { UserRole } from "../../users/user.entity";
export declare function requireRole(allowedRoles: UserRole[]): Type<CanActivate>;
