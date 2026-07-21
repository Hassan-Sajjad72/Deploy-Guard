import { Request } from "express";
import { Repository } from "typeorm";
import { User } from "../users/user.entity";
import { AuditLogQueryDto } from "./dto/audit-log-query.dto";
import { AuditLog } from "./audit-log.entity";
type RecordAuditLogInput = {
    actorUser?: User | null;
    action: string;
    resourceType: string;
    resourceId?: string | number | null;
    status: string;
    metadata?: Record<string, unknown> | null;
    req?: Request;
};
export declare class AuditLogService {
    private readonly auditLogRepository;
    private readonly logger;
    constructor(auditLogRepository: Repository<AuditLog>);
    record(input: RecordAuditLogInput): Promise<void>;
    findForUser(user: User, query: AuditLogQueryDto): Promise<{
        logs: AuditLog[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    private getIpAddress;
    private maskSensitiveMetadata;
}
export {};
