"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRedisConnection = createRedisConnection;
function createRedisConnection(config) {
    return {
        host: config.get("REDIS_HOST", "localhost"),
        port: Number(config.get("REDIS_PORT", "6379")),
        password: config.get("REDIS_PASSWORD") || undefined,
        tls: config.get("REDIS_TLS", "false") === "true" ? {} : undefined,
        maxRetriesPerRequest: null,
    };
}
//# sourceMappingURL=redis.config.js.map