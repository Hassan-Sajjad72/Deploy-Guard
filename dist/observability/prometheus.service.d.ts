import { ConfigService } from "@nestjs/config";
import { AuditLogService } from "../audit-log/audit-log.service";
import { ProjectDeployment } from "../orchestration/project-deployment.entity";
import { LogSanitizerService } from "./log-sanitizer.service";
export declare class PrometheusService {
    private readonly config;
    private readonly auditLogService;
    private readonly sanitizer;
    constructor(config: ConfigService, auditLogService: AuditLogService, sanitizer: LogSanitizerService);
    isEnabled(): boolean;
    queryInstant(query: string): Promise<any>;
    queryRange(query: string, start: Date, end: Date, step: string): Promise<any>;
    getCpuUsage(projectId: string, deployment: ProjectDeployment | null, range?: string): Promise<{
        metricName: string;
        points: any;
    } | {
        metricName: string;
        points: any[];
        error: string;
    }>;
    getMemoryUsage(projectId: string, deployment: ProjectDeployment | null, range?: string): Promise<{
        metricName: string;
        points: any;
    } | {
        metricName: string;
        points: any[];
        error: string;
    }>;
    getHttpLatency(projectId: string, deployment: ProjectDeployment | null, range?: string): Promise<{
        metricName: string;
        points: any;
    } | {
        metricName: string;
        points: any[];
        error: string;
    }>;
    getRequestRate(projectId: string, deployment: ProjectDeployment | null, range?: string): Promise<{
        metricName: string;
        points: any;
    } | {
        metricName: string;
        points: any[];
        error: string;
    }>;
    getRuntimeMetrics(projectId: string, deployment: ProjectDeployment | null, range?: string): Promise<{
        enabled: boolean;
        message: string;
        source?: undefined;
        cpu?: undefined;
        memory?: undefined;
        httpLatency?: undefined;
        requestRate?: undefined;
    } | {
        enabled: boolean;
        source: string;
        cpu: {
            metricName: string;
            points: any;
        } | {
            metricName: string;
            points: any[];
            error: string;
        };
        memory: {
            metricName: string;
            points: any;
        } | {
            metricName: string;
            points: any[];
            error: string;
        };
        httpLatency: {
            metricName: string;
            points: any;
        } | {
            metricName: string;
            points: any[];
            error: string;
        };
        requestRate: {
            metricName: string;
            points: any;
        } | {
            metricName: string;
            points: any[];
            error: string;
        };
        message?: undefined;
    }>;
    private runtimeQuery;
    private query;
    private scopedQuery;
    private normalize;
    private failureMessage;
}
