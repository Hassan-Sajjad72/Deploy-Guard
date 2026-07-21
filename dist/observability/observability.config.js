"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getObservabilityConfig = getObservabilityConfig;
exports.rangeToDates = rangeToDates;
function getObservabilityConfig(config) {
    return {
        prometheusEnabled: config.get("PROMETHEUS_ENABLED", "false") === "true",
        prometheusBaseUrl: config.get("PROMETHEUS_BASE_URL", "http://localhost:9090"),
        prometheusQueryTimeoutSeconds: Number(config.get("PROMETHEUS_QUERY_TIMEOUT_SECONDS", "10")),
        cloudWatchLogsEnabled: config.get("CLOUDWATCH_LOGS_ENABLED", "true") !== "false",
        cloudWatchMetricsEnabled: config.get("CLOUDWATCH_METRICS_ENABLED", "true") !== "false",
        logStreamPollIntervalSeconds: Number(config.get("OBSERVABILITY_LOG_STREAM_POLL_INTERVAL_SECONDS", "5")),
        logStreamMaxEvents: Number(config.get("OBSERVABILITY_LOG_STREAM_MAX_EVENTS", "100")),
        logStreamHeartbeatSeconds: Number(config.get("OBSERVABILITY_LOG_STREAM_HEARTBEAT_SECONDS", "15")),
        maskSecrets: config.get("OBSERVABILITY_MASK_SECRETS", "true") !== "false",
        defaultRange: config.get("OBSERVABILITY_DEFAULT_RANGE", "1h"),
        awsRegion: config.get("AWS_REGION", "us-east-1"),
        prometheusQueries: {
            cpu: config.get("PROMETHEUS_CPU_QUERY", "rate(container_cpu_usage_seconds_total[5m])"),
            memory: config.get("PROMETHEUS_MEMORY_QUERY", "container_memory_working_set_bytes"),
            latency: config.get("PROMETHEUS_HTTP_LATENCY_QUERY", "histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))"),
            requestRate: config.get("PROMETHEUS_REQUEST_RATE_QUERY", "rate(http_requests_total[5m])"),
        },
    };
}
function rangeToDates(range) {
    const now = new Date();
    const hours = range === "24h" ? 24 : range === "6h" ? 6 : 1;
    return {
        start: new Date(now.getTime() - hours * 60 * 60 * 1000),
        end: now,
        seconds: hours * 60 * 60,
    };
}
//# sourceMappingURL=observability.config.js.map