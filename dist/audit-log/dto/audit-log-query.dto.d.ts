export declare class AuditLogQueryDto {
    action?: string;
    resourceType?: string;
    resourceId?: string;
    actorUserId?: string;
    status?: string;
    from?: string;
    to?: string;
    page?: number;
    limit?: number;
}
