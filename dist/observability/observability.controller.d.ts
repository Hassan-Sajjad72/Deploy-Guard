import { Request, Response } from "express";
import { LogQueryOptions } from "./cloudwatch-logs.service";
import { ObservabilityService } from "./observability.service";
import { SseLogStreamService } from "./sse-log-stream.service";
export declare class ObservabilityController {
    private readonly observabilityService;
    private readonly sseLogStreamService;
    constructor(observabilityService: ObservabilityService, sseLogStreamService: SseLogStreamService);
    summary(req: Request, projectId: string): Promise<{
        latestPipelineSummary: import("./project-pipeline-metric-summary.entity").ProjectPipelineMetricSummary;
        latestDeploymentStatus: string;
        logStreaming: {
            available: boolean;
            source: string;
        };
        prometheus: {
            enabled: boolean;
            message: string;
        };
        cloudWatchFallback: {
            logsEnabled: boolean;
            metricsEnabled: boolean;
        };
        latestHealthSummary: {
            targetGroupArn: any;
            healthCheckPath: string;
            status: string;
            albDnsName: string;
            healthyCount: number;
            unhealthyCount: number;
            targetStates: any[];
        } | {
            status: string;
            healthCheckPath: string;
            albDnsName: string;
            healthy: boolean;
            reason?: string;
            targetGroupArn: string | null;
            healthyCount: number;
            unhealthyCount: number;
            targetStates: Record<string, unknown>[];
            checkedAt: string;
        };
    }>;
    pipelineMetrics(req: Request, projectId: string, pipelineRunId?: string): Promise<{
        stageMetrics: any[];
        summary: any;
        githubActions: any;
        trivyScan: any;
    } | {
        githubActions: any;
        trivyScan: {
            id: string;
            scanStatus: string;
            startedAt: Date;
            completedAt: Date;
            durationMs: number;
            totalVulnerabilities: number;
            criticalCount: number;
            highCount: number;
            mediumCount: number;
            lowCount: number;
            unknownCount: number;
            policyDecision: string;
        };
        stageMetrics: import("./project-stage-metric.entity").ProjectStageMetric[];
        summary: import("./project-pipeline-metric-summary.entity").ProjectPipelineMetricSummary;
        pipelineRunId: string;
    }>;
    runtimeMetrics(req: Request, projectId: string, source?: string, range?: string): Promise<any>;
    logs(req: Request, projectId: string, query: LogQueryOptions): Promise<{
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
    streamLogs(req: Request, response: Response, projectId: string, query: LogQueryOptions): Promise<void>;
    health(req: Request, projectId: string): Promise<{
        prometheus: string;
        cloudWatchLogs: string;
        cloudWatchMetrics: string;
        latestEcsStatus: string;
        latestAlbHealth: {
            targetGroupArn: any;
            healthCheckPath: string;
            status: string;
            albDnsName: string;
            healthyCount: number;
            unhealthyCount: number;
            targetStates: any[];
        } | {
            status: string;
            healthCheckPath: string;
            albDnsName: string;
            healthy: boolean;
            reason?: string;
            targetGroupArn: string | null;
            healthyCount: number;
            unhealthyCount: number;
            targetStates: Record<string, unknown>[];
            checkedAt: string;
        };
    }>;
    private normalizeLogQuery;
}
