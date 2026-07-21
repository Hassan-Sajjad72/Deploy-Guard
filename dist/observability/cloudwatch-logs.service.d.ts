import { ConfigService } from "@nestjs/config";
import { Response } from "express";
import { Repository } from "typeorm";
import { AuditLogService } from "../audit-log/audit-log.service";
import { ProjectDeployment } from "../orchestration/project-deployment.entity";
import { User } from "../users/user.entity";
import { LogSanitizerService } from "./log-sanitizer.service";
import { ProjectLogStreamSession } from "./project-log-stream-session.entity";
export type LogQueryOptions = {
    pipelineRunId?: string;
    deploymentId?: string;
    taskId?: string;
    logGroupName?: string;
    logStreamName?: string;
    since?: string;
    stream?: "stdout" | "stderr" | "all";
    limit?: number;
};
export declare class CloudWatchLogsService {
    private readonly deploymentRepository;
    private readonly sessionRepository;
    private readonly config;
    private readonly sanitizer;
    private readonly auditLogService;
    constructor(deploymentRepository: Repository<ProjectDeployment>, sessionRepository: Repository<ProjectLogStreamSession>, config: ConfigService, sanitizer: LogSanitizerService, auditLogService: AuditLogService);
    resolveLogGroupForProject(projectId: string, deploymentId?: string): Promise<string>;
    resolveLogStreams(projectId: string, deploymentId?: string, taskId?: string, logGroupName?: string): Promise<string[]>;
    fetchLogEvents(logGroupName: string, logStreamName?: string, nextToken?: string, limit?: number, startTime?: number): Promise<{
        events: {
            timestamp: string;
            message: string;
            logStreamName: string;
        }[];
        nextToken: string;
    }>;
    sanitizeLogEvent(event: {
        timestamp?: number;
        message?: string;
        logStreamName?: string | null;
    }, logStreamName?: string | null): {
        timestamp: string;
        message: string;
        logStreamName: string;
    };
    getRecentLogs(projectId: string, options: LogQueryOptions): Promise<{
        enabled: boolean;
        message: string;
        events: any[];
        logGroupName?: undefined;
        logStreamName?: undefined;
        nextToken?: undefined;
    } | {
        enabled: boolean;
        logGroupName: string;
        logStreamName: string;
        events: {
            timestamp: string;
            message: string;
            logStreamName: string;
        }[];
        nextToken: string;
        message?: undefined;
    }>;
    streamLogsToSse(projectId: string, options: LogQueryOptions, response: Response, actorUser?: User | null): Promise<void>;
    private findDeployment;
    private client;
    private sleep;
    private failureMessage;
}
