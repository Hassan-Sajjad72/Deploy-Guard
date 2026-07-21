import { ConfigService } from "@nestjs/config";
export type ObservabilityRange = "1h" | "6h" | "24h";
export declare function getObservabilityConfig(config: ConfigService): {
    prometheusEnabled: boolean;
    prometheusBaseUrl: string;
    prometheusQueryTimeoutSeconds: number;
    cloudWatchLogsEnabled: boolean;
    cloudWatchMetricsEnabled: boolean;
    logStreamPollIntervalSeconds: number;
    logStreamMaxEvents: number;
    logStreamHeartbeatSeconds: number;
    maskSecrets: boolean;
    defaultRange: ObservabilityRange;
    awsRegion: string;
    prometheusQueries: {
        cpu: string;
        memory: string;
        latency: string;
        requestRate: string;
    };
};
export declare function rangeToDates(range: string): {
    start: Date;
    end: Date;
    seconds: number;
};
