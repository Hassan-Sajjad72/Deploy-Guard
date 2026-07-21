import { Repository } from "typeorm";
import { AuditLogService } from "../audit-log/audit-log.service";
import { AlbService } from "../orchestration/alb.service";
import { ProjectDeployment } from "../orchestration/project-deployment.entity";
import { ProjectPipelineRun } from "../projects/project-pipeline-run.entity";
import { Project } from "../projects/project.entity";
import { User } from "../users/user.entity";
import { CloudWatchLogsService, LogQueryOptions } from "./cloudwatch-logs.service";
import { CloudWatchMetricsService } from "./cloudwatch-metrics.service";
import { GithubActionsMetricsService } from "./github-actions-metrics.service";
import { LogSanitizerService } from "./log-sanitizer.service";
import { PipelineMetricsService } from "./pipeline-metrics.service";
import { ProjectObservabilityEvent } from "./project-observability-event.entity";
import { ProjectRuntimeMetricSnapshot } from "./project-runtime-metric-snapshot.entity";
import { PrometheusService } from "./prometheus.service";
import { TrivyMetricsService } from "./trivy-metrics.service";
export declare class ObservabilityService {
    private readonly projectRepository;
    private readonly runRepository;
    private readonly deploymentRepository;
    private readonly runtimeSnapshotRepository;
    private readonly eventRepository;
    private readonly pipelineMetrics;
    private readonly githubMetrics;
    private readonly trivyMetrics;
    private readonly prometheus;
    private readonly cloudWatchMetrics;
    private readonly cloudWatchLogs;
    private readonly albService;
    private readonly auditLogService;
    private readonly sanitizer;
    constructor(projectRepository: Repository<Project>, runRepository: Repository<ProjectPipelineRun>, deploymentRepository: Repository<ProjectDeployment>, runtimeSnapshotRepository: Repository<ProjectRuntimeMetricSnapshot>, eventRepository: Repository<ProjectObservabilityEvent>, pipelineMetrics: PipelineMetricsService, githubMetrics: GithubActionsMetricsService, trivyMetrics: TrivyMetricsService, prometheus: PrometheusService, cloudWatchMetrics: CloudWatchMetricsService, cloudWatchLogs: CloudWatchLogsService, albService: AlbService, auditLogService: AuditLogService, sanitizer: LogSanitizerService);
    getSummary(user: User, projectId: string): Promise<{
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
    getPipelineMetrics(user: User, projectId: string, pipelineRunId?: string): Promise<{
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
    getRuntimeMetrics(user: User, projectId: string, source?: string, range?: string): Promise<any>;
    getLogs(user: User, projectId: string, options: LogQueryOptions): Promise<{
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
    getHealth(user: User, projectId: string): Promise<{
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
    recordEvent(projectId: string, eventType: string, status: string, message: string, actorUser?: User | null, metadata?: Record<string, unknown>): Promise<ProjectObservabilityEvent>;
    findProjectForView(user: User, projectId: string): Promise<Project>;
    private latestDeployment;
    private saveRuntimeSnapshots;
    private audit;
}
