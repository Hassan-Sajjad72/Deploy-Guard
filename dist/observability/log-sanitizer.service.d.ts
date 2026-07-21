export declare class LogSanitizerService {
    sanitize(value: unknown): string;
    sanitizeMetadata(metadata?: Record<string, unknown>): Record<string, unknown>;
    private mask;
}
