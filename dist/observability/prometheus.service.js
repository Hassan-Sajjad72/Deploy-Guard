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
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrometheusService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const audit_log_service_1 = require("../audit-log/audit-log.service");
const log_sanitizer_service_1 = require("./log-sanitizer.service");
const observability_config_1 = require("./observability.config");
let PrometheusService = class PrometheusService {
    constructor(config, auditLogService, sanitizer) {
        this.config = config;
        this.auditLogService = auditLogService;
        this.sanitizer = sanitizer;
    }
    isEnabled() {
        return (0, observability_config_1.getObservabilityConfig)(this.config).prometheusEnabled;
    }
    async queryInstant(query) {
        return this.query("/api/v1/query", { query });
    }
    async queryRange(query, start, end, step) {
        return this.query("/api/v1/query_range", {
            query,
            start: String(Math.floor(start.getTime() / 1000)),
            end: String(Math.floor(end.getTime() / 1000)),
            step,
        });
    }
    async getCpuUsage(projectId, deployment, range = "1h") {
        return this.runtimeQuery(projectId, "cpu", (0, observability_config_1.getObservabilityConfig)(this.config).prometheusQueries.cpu, deployment, range);
    }
    async getMemoryUsage(projectId, deployment, range = "1h") {
        return this.runtimeQuery(projectId, "memory", (0, observability_config_1.getObservabilityConfig)(this.config).prometheusQueries.memory, deployment, range);
    }
    async getHttpLatency(projectId, deployment, range = "1h") {
        return this.runtimeQuery(projectId, "http_latency", (0, observability_config_1.getObservabilityConfig)(this.config).prometheusQueries.latency, deployment, range);
    }
    async getRequestRate(projectId, deployment, range = "1h") {
        return this.runtimeQuery(projectId, "request_rate", (0, observability_config_1.getObservabilityConfig)(this.config).prometheusQueries.requestRate, deployment, range);
    }
    async getRuntimeMetrics(projectId, deployment, range = "1h") {
        if (!this.isEnabled()) {
            return { enabled: false, message: "Prometheus is not configured." };
        }
        return {
            enabled: true,
            source: "prometheus",
            cpu: await this.getCpuUsage(projectId, deployment, range),
            memory: await this.getMemoryUsage(projectId, deployment, range),
            httpLatency: await this.getHttpLatency(projectId, deployment, range),
            requestRate: await this.getRequestRate(projectId, deployment, range),
        };
    }
    async runtimeQuery(projectId, metricName, query, deployment, range) {
        const { start, end } = (0, observability_config_1.rangeToDates)(range);
        await this.auditLogService.record({
            actorUser: null,
            action: "PROMETHEUS_QUERY_STARTED",
            resourceType: "observability",
            resourceId: projectId,
            status: "success",
            metadata: this.sanitizer.sanitizeMetadata({ projectId, metricName, range }),
        });
        try {
            const result = await this.queryRange(this.scopedQuery(query, deployment), start, end, "60s");
            await this.auditLogService.record({
                actorUser: null,
                action: "PROMETHEUS_QUERY_SUCCEEDED",
                resourceType: "observability",
                resourceId: projectId,
                status: "success",
                metadata: this.sanitizer.sanitizeMetadata({ projectId, metricName, range }),
            });
            return this.normalize(metricName, result);
        }
        catch (error) {
            const message = this.failureMessage(error, "Prometheus query failed.");
            await this.auditLogService.record({
                actorUser: null,
                action: "PROMETHEUS_QUERY_FAILED",
                resourceType: "observability",
                resourceId: projectId,
                status: "failed",
                metadata: this.sanitizer.sanitizeMetadata({ projectId, metricName, range, reason: message }),
            });
            return { metricName, points: [], error: message };
        }
    }
    async query(path, params) {
        const config = (0, observability_config_1.getObservabilityConfig)(this.config);
        const url = new URL(path, config.prometheusBaseUrl);
        for (const [key, value] of Object.entries(params)) {
            url.searchParams.set(key, value);
        }
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), config.prometheusQueryTimeoutSeconds * 1000);
        try {
            const response = await fetch(url, { signal: controller.signal });
            if (!response.ok) {
                throw new Error(`prometheus_${response.status}`);
            }
            return response.json();
        }
        finally {
            clearTimeout(timeout);
        }
    }
    scopedQuery(query, deployment) {
        if (!deployment?.ecsServiceName) {
            return query;
        }
        return query.replace(/\$service/g, deployment.ecsServiceName).replace(/\$cluster/g, deployment.ecsClusterName || "");
    }
    normalize(metricName, response) {
        const series = response?.data?.result || [];
        return {
            metricName,
            points: series.flatMap((item) => (item.values || []).map(([timestamp, value]) => ({
                timestamp: new Date(timestamp * 1000).toISOString(),
                value: Number(value),
                labels: this.sanitizer.sanitizeMetadata(item.metric || {}),
            }))),
        };
    }
    failureMessage(error, fallback) {
        if (!error || typeof error !== "object") {
            return fallback;
        }
        const typed = error;
        return typed.name || typed.message ? `${fallback} ${typed.name || typed.message}` : fallback;
    }
};
exports.PrometheusService = PrometheusService;
exports.PrometheusService = PrometheusService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        audit_log_service_1.AuditLogService,
        log_sanitizer_service_1.LogSanitizerService])
], PrometheusService);
//# sourceMappingURL=prometheus.service.js.map