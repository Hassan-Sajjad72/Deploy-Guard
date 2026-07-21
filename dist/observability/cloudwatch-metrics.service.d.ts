import { ConfigService } from "@nestjs/config";
import { AuditLogService } from "../audit-log/audit-log.service";
import { ProjectDeployment } from "../orchestration/project-deployment.entity";
import { LogSanitizerService } from "./log-sanitizer.service";
export declare class CloudWatchMetricsService {
    private readonly config;
    private readonly auditLogService;
    private readonly sanitizer;
    constructor(config: ConfigService, auditLogService: AuditLogService, sanitizer: LogSanitizerService);
    isEnabled(): boolean;
    getEcsCpuMemory(projectId: string, deployment: ProjectDeployment | null, range?: string): Promise<{
        cpu: {
            metricName: string;
            points: any[];
        } | {
            metricName?: string;
            points: {
                timestamp: string;
                value: number;
            }[];
        };
        memory: {
            metricName: string;
            points: any[];
        } | {
            metricName?: string;
            points: {
                timestamp: string;
                value: number;
            }[];
        };
    }>;
    getAlbLatency(projectId: string, deployment: ProjectDeployment | null, range?: string): Promise<{
        metricName: string;
        points: any[];
    } | {
        metricName?: string;
        points: {
            timestamp: string;
            value: number;
        }[];
    }>;
    getAlbRequestStats(projectId: string, deployment: ProjectDeployment | null, range?: string): Promise<{
        requestRate: {
            metricName: string;
            points: any[];
        } | {
            metricName?: string;
            points: {
                timestamp: string;
                value: number;
            }[];
        };
        target5xx: {
            metricName: string;
            points: any[];
        } | {
            metricName?: string;
            points: {
                timestamp: string;
                value: number;
            }[];
        };
        healthyHosts: {
            metricName: string;
            points: any[];
        } | {
            metricName?: string;
            points: {
                timestamp: string;
                value: number;
            }[];
        };
        unhealthyHosts: {
            metricName: string;
            points: any[];
        } | {
            metricName?: string;
            points: {
                timestamp: string;
                value: number;
            }[];
        };
    }>;
    getRuntimeMetricFallback(projectId: string, deployment: ProjectDeployment | null, range?: string): Promise<{
        enabled: boolean;
        message: string;
        source?: undefined;
        cpu?: undefined;
        memory?: undefined;
        httpLatency?: undefined;
        requestRate?: undefined;
        target5xx?: undefined;
        healthyHosts?: undefined;
        unhealthyHosts?: undefined;
    } | {
        enabled: boolean;
        source: string;
        cpu: {
            metricName: string;
            points: any[];
        } | {
            metricName?: string;
            points: {
                timestamp: string;
                value: number;
            }[];
        };
        memory: {
            metricName: string;
            points: any[];
        } | {
            metricName?: string;
            points: {
                timestamp: string;
                value: number;
            }[];
        };
        httpLatency: {
            metricName: string;
            points: any[];
        } | {
            metricName?: string;
            points: {
                timestamp: string;
                value: number;
            }[];
        };
        requestRate: {
            metricName: string;
            points: any[];
        } | {
            metricName?: string;
            points: {
                timestamp: string;
                value: number;
            }[];
        };
        target5xx: {
            metricName: string;
            points: any[];
        } | {
            metricName?: string;
            points: {
                timestamp: string;
                value: number;
            }[];
        };
        healthyHosts: {
            metricName: string;
            points: any[];
        } | {
            metricName?: string;
            points: {
                timestamp: string;
                value: number;
            }[];
        };
        unhealthyHosts: {
            metricName: string;
            points: any[];
        } | {
            metricName?: string;
            points: {
                timestamp: string;
                value: number;
            }[];
        };
        message?: undefined;
    } | {
        enabled: boolean;
        source: string;
        message: string;
        cpu?: undefined;
        memory?: undefined;
        httpLatency?: undefined;
        requestRate?: undefined;
        target5xx?: undefined;
        healthyHosts?: undefined;
        unhealthyHosts?: undefined;
    }>;
    private fetch;
    private metricQuery;
    private empty;
    private albDimension;
    private targetGroupDimension;
    private client;
    private failureMessage;
}
