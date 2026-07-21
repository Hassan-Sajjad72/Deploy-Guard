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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CloudWatchLogsService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const client_cloudwatch_logs_1 = require("@aws-sdk/client-cloudwatch-logs");
const typeorm_2 = require("typeorm");
const audit_log_service_1 = require("../audit-log/audit-log.service");
const project_deployment_entity_1 = require("../orchestration/project-deployment.entity");
const observability_config_1 = require("./observability.config");
const log_sanitizer_service_1 = require("./log-sanitizer.service");
const project_log_stream_session_entity_1 = require("./project-log-stream-session.entity");
let CloudWatchLogsService = class CloudWatchLogsService {
    constructor(deploymentRepository, sessionRepository, config, sanitizer, auditLogService) {
        this.deploymentRepository = deploymentRepository;
        this.sessionRepository = sessionRepository;
        this.config = config;
        this.sanitizer = sanitizer;
        this.auditLogService = auditLogService;
    }
    async resolveLogGroupForProject(projectId, deploymentId) {
        const deployment = await this.findDeployment(projectId, deploymentId);
        const metadata = deployment?.metadata || {};
        return String(metadata.logGroupName ||
            metadata.cloudWatchLogGroupName ||
            this.config.get("CLOUDWATCH_LOG_GROUP_NAME", "") ||
            `/ecs/deployguard/${projectId}`);
    }
    async resolveLogStreams(projectId, deploymentId, taskId, logGroupName) {
        const groupName = logGroupName || await this.resolveLogGroupForProject(projectId, deploymentId);
        const response = await this.client().send(new client_cloudwatch_logs_1.DescribeLogStreamsCommand({
            logGroupName: groupName,
            descending: true,
            orderBy: "LastEventTime",
            logStreamNamePrefix: taskId,
            limit: 20,
        }));
        return (response.logStreams || []).map((stream) => stream.logStreamName).filter(Boolean);
    }
    async fetchLogEvents(logGroupName, logStreamName, nextToken, limit = 100, startTime) {
        if (logStreamName) {
            const response = await this.client().send(new client_cloudwatch_logs_1.GetLogEventsCommand({
                logGroupName,
                logStreamName,
                nextToken,
                startTime,
                limit,
                startFromHead: false,
            }));
            return {
                events: (response.events || []).map((event) => this.sanitizeLogEvent(event, logStreamName)),
                nextToken: response.nextForwardToken,
            };
        }
        const response = await this.client().send(new client_cloudwatch_logs_1.FilterLogEventsCommand({
            logGroupName,
            startTime,
            limit,
            nextToken,
        }));
        return {
            events: (response.events || []).map((event) => this.sanitizeLogEvent(event, event.logStreamName || null)),
            nextToken: response.nextToken,
        };
    }
    sanitizeLogEvent(event, logStreamName) {
        return {
            timestamp: event.timestamp ? new Date(event.timestamp).toISOString() : new Date().toISOString(),
            message: this.sanitizer.sanitize(event.message || ""),
            logStreamName: this.sanitizer.sanitize(logStreamName || event.logStreamName || ""),
        };
    }
    async getRecentLogs(projectId, options) {
        const config = (0, observability_config_1.getObservabilityConfig)(this.config);
        if (!config.cloudWatchLogsEnabled) {
            return { enabled: false, message: "CloudWatch Logs are disabled.", events: [] };
        }
        const logGroupName = options.logGroupName || await this.resolveLogGroupForProject(projectId, options.deploymentId);
        const streams = options.logStreamName
            ? [options.logStreamName]
            : await this.resolveLogStreams(projectId, options.deploymentId, options.taskId, logGroupName).catch(() => []);
        const streamName = streams[0] || undefined;
        const limit = Math.min(Number(options.limit || config.logStreamMaxEvents), config.logStreamMaxEvents);
        const startTime = options.since ? new Date(options.since).getTime() : undefined;
        const result = await this.fetchLogEvents(logGroupName, streamName, undefined, limit, startTime);
        return {
            enabled: true,
            logGroupName: this.sanitizer.sanitize(logGroupName),
            logStreamName: this.sanitizer.sanitize(streamName || ""),
            events: result.events,
            nextToken: result.nextToken,
        };
    }
    async streamLogsToSse(projectId, options, response, actorUser) {
        const config = (0, observability_config_1.getObservabilityConfig)(this.config);
        const session = await this.sessionRepository.save(this.sessionRepository.create({
            projectId,
            pipelineRunId: options.pipelineRunId || null,
            deploymentId: options.deploymentId || null,
            userId: actorUser?.id || null,
            status: project_log_stream_session_entity_1.LogStreamSessionStatus.STARTED,
            source: "cloudwatch_logs",
            startedAt: new Date(),
            metadata: this.sanitizer.sanitizeMetadata({ stream: options.stream || "all", limit: options.limit }),
        }));
        response.setHeader("Content-Type", "text/event-stream");
        response.setHeader("Cache-Control", "no-cache, no-transform");
        response.setHeader("Connection", "keep-alive");
        response.flushHeaders?.();
        const send = (event, data) => {
            response.write(`event: ${event}\n`);
            response.write(`data: ${JSON.stringify(data)}\n\n`);
        };
        let stopped = false;
        response.on("close", () => {
            stopped = true;
        });
        try {
            if (!config.cloudWatchLogsEnabled) {
                send("error", { message: "CloudWatch Logs are disabled." });
                return;
            }
            const logGroupName = options.logGroupName || await this.resolveLogGroupForProject(projectId, options.deploymentId);
            const streams = options.logStreamName
                ? [options.logStreamName]
                : await this.resolveLogStreams(projectId, options.deploymentId, options.taskId, logGroupName);
            const logStreamName = streams[0];
            let nextToken;
            session.status = project_log_stream_session_entity_1.LogStreamSessionStatus.ACTIVE;
            session.logGroupName = this.sanitizer.sanitize(logGroupName);
            session.logStreamName = this.sanitizer.sanitize(logStreamName || "");
            await this.sessionRepository.save(session);
            await this.auditLogService.record({
                actorUser,
                action: "LOG_STREAM_STARTED",
                resourceType: "observability",
                resourceId: projectId,
                status: "success",
                metadata: this.sanitizer.sanitizeMetadata({ projectId, deploymentId: options.deploymentId, logGroupName, logStreamName }),
            });
            send("connected", { sessionId: session.id, logGroupName: session.logGroupName, logStreamName: session.logStreamName });
            while (!stopped) {
                const result = await this.fetchLogEvents(logGroupName, logStreamName, nextToken, config.logStreamMaxEvents);
                nextToken = result.nextToken;
                for (const event of result.events) {
                    send("log_line", event);
                }
                send("heartbeat", { timestamp: new Date().toISOString() });
                await this.sleep(config.logStreamPollIntervalSeconds * 1000);
            }
            send("completed", { sessionId: session.id });
            session.status = project_log_stream_session_entity_1.LogStreamSessionStatus.STOPPED;
            session.stoppedAt = new Date();
            await this.sessionRepository.save(session);
            await this.auditLogService.record({
                actorUser,
                action: "LOG_STREAM_STOPPED",
                resourceType: "observability",
                resourceId: projectId,
                status: "success",
                metadata: this.sanitizer.sanitizeMetadata({ projectId, deploymentId: options.deploymentId }),
            });
        }
        catch (error) {
            const message = this.failureMessage(error, "CloudWatch log stream failed.");
            send("error", { message });
            session.status = project_log_stream_session_entity_1.LogStreamSessionStatus.FAILED;
            session.errorMessage = message;
            session.stoppedAt = new Date();
            await this.sessionRepository.save(session);
            await this.auditLogService.record({
                actorUser,
                action: "LOG_STREAM_FAILED",
                resourceType: "observability",
                resourceId: projectId,
                status: "failed",
                metadata: this.sanitizer.sanitizeMetadata({ projectId, deploymentId: options.deploymentId, reason: message }),
            });
        }
        finally {
            response.end();
        }
    }
    findDeployment(projectId, deploymentId) {
        return this.deploymentRepository.findOne({
            where: { projectId, ...(deploymentId ? { id: deploymentId } : {}) },
            order: { createdAt: "DESC" },
        });
    }
    client() {
        return new client_cloudwatch_logs_1.CloudWatchLogsClient({ region: this.config.get("AWS_REGION", "us-east-1") });
    }
    sleep(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
    failureMessage(error, fallback) {
        if (!error || typeof error !== "object") {
            return fallback;
        }
        const awsError = error;
        return awsError.name ? `${fallback} ${awsError.name}` : fallback;
    }
};
exports.CloudWatchLogsService = CloudWatchLogsService;
exports.CloudWatchLogsService = CloudWatchLogsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(project_deployment_entity_1.ProjectDeployment)),
    __param(1, (0, typeorm_1.InjectRepository)(project_log_stream_session_entity_1.ProjectLogStreamSession)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        config_1.ConfigService,
        log_sanitizer_service_1.LogSanitizerService,
        audit_log_service_1.AuditLogService])
], CloudWatchLogsService);
//# sourceMappingURL=cloudwatch-logs.service.js.map