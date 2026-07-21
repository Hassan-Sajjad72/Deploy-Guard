export declare class AuditLog {
    id: string;
    actorUserId: string;
    actorEmail: string;
    actorRole: string;
    action: string;
    resourceType: string;
    resourceId: string;
    status: string;
    ipAddress: string;
    userAgent: string;
    metadata: Record<string, unknown> | null;
    createdAt: Date;
}
