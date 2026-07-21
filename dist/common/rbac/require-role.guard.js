"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireRole = requireRole;
const common_1 = require("@nestjs/common");
function requireRole(allowedRoles) {
    class RoleGuard {
        canActivate(context) {
            const request = context.switchToHttp().getRequest();
            const user = request.user;
            if (!user) {
                throw new common_1.UnauthorizedException("Authentication required");
            }
            if (!allowedRoles.includes(user.role)) {
                throw new common_1.ForbiddenException("Insufficient permissions");
            }
            return true;
        }
    }
    return (0, common_1.mixin)(RoleGuard);
}
//# sourceMappingURL=require-role.guard.js.map