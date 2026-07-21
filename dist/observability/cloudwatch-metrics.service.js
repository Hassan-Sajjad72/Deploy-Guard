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
exports.CloudWatchMetricsService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const client_cloudwatch_1 = require("@aws-sdk/client-cloudwatch");
const audit_log_service_1 = require("../audit-log/audit-log.service");
const log_sanitizer_service_1 = require("./log-sanitizer.service");
const observability_config_1 = require("./observability.config");
let CloudWatchMetricsService = class CloudWatchMetricsService {
    constructor(config, auditLogService, sanitizer) {
        this.config = config;
        this.auditLogService = auditLogService;
        this.sanitizer = sanitizer;
    }
    isEnabled() {
        return (0, observability_config_1.getObservabilityConfig)(this.config).cloudWatchMetricsEnabled;
    }
    async getEcsCpuMemory(projectId, deployment, range = "1h") {
        if (!deployment?.ecsClusterName || !deployment.ecsServiceName) {
            return { cpu: this.empty("ecs_cpu"), memory: this.empty("ecs_memory") };
        }
        const { start, end } = (0, observability_config_1.rangeToDates)(range);
        const queries = [
            this.metricQuery("ecs_cpu", "AWS/ECS", "CPUUtilization", "Percent", [
                { Name: "ClusterName", Value: deployment.ecsClusterName },
                { Name: "ServiceName", Value: deployment.ecsServiceName },
            ]),
            this.metricQuery("ecs_memory", "AWS/ECS", "MemoryUtilization", "Percent", [
                { Name: "ClusterName", Value: deployment.ecsClusterName },
                { Name: "ServiceName", Value: deployment.ecsServiceName },
            ]),
        ];
        const data = await this.fetch(projectId, queries, start, end, range);
        return { cpu: data.ecs_cpu || this.empty("ecs_cpu"), memory: data.ecs_memory || this.empty("ecs_memory") };
    }
    async getAlbLatency(projectId, deployment, range = "1h") {
        const loadBalancer = this.albDimension(deployment?.albArn);
        const targetGroup = this.targetGroupDimension(deployment?.targetGroupArn);
        if (!loadBalancer || !targetGroup) {
            return this.empty("alb_latency");
        }
        const { start, end } = (0, observability_config_1.rangeToDates)(range);
        const data = await this.fetch(projectId, [
            this.metricQuery("alb_latency", "AWS/ApplicationELB", "TargetResponseTime", "Seconds", [
                { Name: "LoadBalancer", Value: loadBalancer },
                { Name: "TargetGroup", Value: targetGroup },
            ]),
        ], start, end, range);
        return data.alb_latency || this.empty("alb_latency");
    }
    async getAlbRequestStats(projectId, deployment, range = "1h") {
        const loadBalancer = this.albDimension(deployment?.albArn);
        const targetGroup = this.targetGroupDimension(deployment?.targetGroupArn);
        if (!loadBalancer || !targetGroup) {
            return {
                requestRate: this.empty("alb_request_count"),
                target5xx: this.empty("alb_target_5xx"),
                healthyHosts: this.empty("alb_healthy_hosts"),
                unhealthyHosts: this.empty("alb_unhealthy_hosts"),
            };
        }
        const { start, end } = (0, observability_config_1.rangeToDates)(range);
        const dimensions = [
            { Name: "LoadBalancer", Value: loadBalancer },
            { Name: "TargetGroup", Value: targetGroup },
        ];
        const data = await this.fetch(projectId, [
            this.metricQuery("alb_request_count", "AWS/ApplicationELB", "RequestCount", "Count", dimensions, "Sum"),
            this.metricQuery("alb_target_5xx", "AWS/ApplicationELB", "HTTPCode_Target_5XX_Count", "Count", dimensions, "Sum"),
            this.metricQuery("alb_healthy_hosts", "AWS/ApplicationELB", "HealthyHostCount", "Count", dimensions),
            this.metricQuery("alb_unhealthy_hosts", "AWS/ApplicationELB", "UnHealthyHostCount", "Count", dimensions),
        ], start, end, range);
        return {
            requestRate: data.alb_request_count || this.empty("alb_request_count"),
            target5xx: data.alb_target_5xx || this.empty("alb_target_5xx"),
            healthyHosts: data.alb_healthy_hosts || this.empty("alb_healthy_hosts"),
            unhealthyHosts: data.alb_unhealthy_hosts || this.empty("alb_unhealthy_hosts"),
        };
    }
    async getRuntimeMetricFallback(projectId, deployment, range = "1h") {
        if (!this.isEnabled()) {
            return { enabled: false, message: "CloudWatch metrics are disabled." };
        }
        try {
            const ecs = await this.getEcsCpuMemory(projectId, deployment, range);
            const albLatency = await this.getAlbLatency(projectId, deployment, range);
            const albStats = await this.getAlbRequestStats(projectId, deployment, range);
            return {
                enabled: true,
                source: "cloudwatch",
                cpu: ecs.cpu,
                memory: ecs.memory,
                httpLatency: albLatency,
                requestRate: albStats.requestRate,
                target5xx: albStats.target5xx,
                healthyHosts: albStats.healthyHosts,
                unhealthyHosts: albStats.unhealthyHosts,
            };
        }
        catch (error) {
            return {
                enabled: false,
                source: "cloudwatch",
                message: this.failureMessage(error, "CloudWatch metrics are unavailable."),
            };
        }
    }
    async fetch(projectId, queries, start, end, range) {
        await this.auditLogService.record({
            actorUser: null,
            action: "CLOUDWATCH_METRICS_QUERIED",
            resourceType: "observability",
            resourceId: projectId,
            status: "success",
            metadata: this.sanitizer.sanitizeMetadata({ projectId, range }),
        });
        const response = await this.client().send(new client_cloudwatch_1.GetMetricDataCommand({
            StartTime: start,
            EndTime: end,
            MetricDataQueries: queries,
        }));
        return (response.MetricDataResults || []).reduce((output, item) => {
            output[item.Id || "metric"] = {
                metricName: item.Id,
                points: (item.Timestamps || []).map((timestamp, index) => ({
                    timestamp: timestamp.toISOString(),
                    value: Number(item.Values?.[index] || 0),
                })).reverse(),
            };
            return output;
        }, {});
    }
    metricQuery(id, namespace, metricName, unit, dimensions, stat = "Average") {
        return {
            Id: id,
            MetricStat: {
                Period: 60,
                Stat: stat,
                Metric: {
                    Namespace: namespace,
                    MetricName: metricName,
                    Dimensions: dimensions,
                },
                Unit: unit,
            },
            ReturnData: true,
        };
    }
    empty(metricName) {
        return { metricName, points: [] };
    }
    albDimension(arn) {
        if (!arn)
            return null;
        return arn.split(":loadbalancer/")[1] || null;
    }
    targetGroupDimension(arn) {
        if (!arn)
            return null;
        return arn.split(":targetgroup/")[1] ? `targetgroup/${arn.split(":targetgroup/")[1]}` : null;
    }
    client() {
        return new client_cloudwatch_1.CloudWatchClient({ region: this.config.get("AWS_REGION", "us-east-1") });
    }
    failureMessage(error, fallback) {
        if (!error || typeof error !== "object") {
            return fallback;
        }
        const typed = error;
        return typed.name ? `${fallback} ${typed.name}` : fallback;
    }
};
exports.CloudWatchMetricsService = CloudWatchMetricsService;
exports.CloudWatchMetricsService = CloudWatchMetricsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        audit_log_service_1.AuditLogService,
        log_sanitizer_service_1.LogSanitizerService])
], CloudWatchMetricsService);
//# sourceMappingURL=cloudwatch-metrics.service.js.map