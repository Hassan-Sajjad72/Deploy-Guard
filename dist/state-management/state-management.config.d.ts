import { ConfigService } from "@nestjs/config";
export type StateManagementConfig = {
    bucket: string;
    prefix: string;
    lockTable: string;
    region: string;
    heartbeatIntervalSeconds: number;
    staleAfterSeconds: number;
    monitorIntervalSeconds: number;
    resourceDropWarningPercent: number;
    orphanAutoRecovery: boolean;
    forceReleaseEnabled: boolean;
    mockMode: boolean;
};
export declare function getStateManagementConfig(config: ConfigService): StateManagementConfig;
