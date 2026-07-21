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
var AuditLogService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditLogService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const audit_log_entity_1 = require("./audit-log.entity");
const SENSITIVE_KEYS = [
    "password",
    "token",
    "secret",
    "authorization",
    "accessToken",
    "refreshToken",
    "apiKey",
    "credential",
    "env",
    "cookie",
];
let AuditLogService = AuditLogService_1 = class AuditLogService {
    constructor(auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
        this.logger = new common_1.Logger(AuditLogService_1.name);
    }
    async record(input) {
        try {
            const actorUser = input.actorUser;
            const auditLog = this.auditLogRepository.create({
                actorUserId: actorUser ? String(actorUser.id) : null,
                actorEmail: actorUser?.email || null,
                actorRole: actorUser?.role || null,
                action: input.action,
                resourceType: input.resourceType,
                resourceId: input.resourceId === undefined || input.resourceId === null
                    ? null
                    : String(input.resourceId),
                status: input.status,
                ipAddress: this.getIpAddress(input.req),
                userAgent: input.req?.header("user-agent") || null,
                metadata: input.metadata
                    ? this.maskSensitiveMetadata(input.metadata)
                    : null,
            });
            await this.auditLogRepository.save(auditLog);
        }
        catch (error) {
            this.logger.error("Failed to record audit log", error);
        }
    }
    async findForUser(user, query) {
        const page = query.page || 1;
        const limit = Math.min(query.limit || 20, 100);
        const queryBuilder = this.auditLogRepository
            .createQueryBuilder("auditLog")
            .orderBy("auditLog.createdAt", "DESC")
            .skip((page - 1) * limit)
            .take(limit);
        if (user.role !== "admin") {
            queryBuilder.andWhere("auditLog.actorUserId = :currentUserId", {
                currentUserId: String(user.id),
            });
        }
        else if (query.actorUserId) {
            queryBuilder.andWhere("auditLog.actorUserId = :actorUserId", {
                actorUserId: query.actorUserId,
            });
        }
        if (query.action) {
            queryBuilder.andWhere("auditLog.action = :action", { action: query.action });
        }
        if (query.resourceType) {
            queryBuilder.andWhere("auditLog.resourceType = :resourceType", {
                resourceType: query.resourceType,
            });
        }
        if (query.resourceId) {
            queryBuilder.andWhere("auditLog.resourceId = :resourceId", {
                resourceId: query.resourceId,
            });
        }
        if (query.status) {
            queryBuilder.andWhere("auditLog.status = :status", { status: query.status });
        }
        if (query.from) {
            queryBuilder.andWhere("auditLog.createdAt >= :from", {
                from: new Date(query.from),
            });
        }
        if (query.to) {
            queryBuilder.andWhere("auditLog.createdAt <= :to", {
                to: new Date(query.to),
            });
        }
        const [logs, total] = await queryBuilder.getManyAndCount();
        return {
            logs,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    getIpAddress(req) {
        if (!req) {
            return null;
        }
        return req.ip || req.socket.remoteAddress || null;
    }
    maskSensitiveMetadata(value) {
        if (Array.isArray(value)) {
            return value.map((item) => this.maskSensitiveMetadata(item));
        }
        if (value && typeof value === "object") {
            return Object.entries(value).reduce((masked, [key, nestedValue]) => {
                const normalizedKey = key.toLowerCase();
                const isSensitive = SENSITIVE_KEYS.some((sensitiveKey) => normalizedKey.includes(sensitiveKey.toLowerCase()));
                masked[key] = isSensitive
                    ? "[REDACTED]"
                    : this.maskSensitiveMetadata(nestedValue);
                return masked;
            }, {});
        }
        return value;
    }
};
exports.AuditLogService = AuditLogService;
exports.AuditLogService = AuditLogService = AuditLogService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(audit_log_entity_1.AuditLog)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], AuditLogService);
//# sourceMappingURL=audit-log.service.js.map