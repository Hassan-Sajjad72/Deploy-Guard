import { ConfigService } from "@nestjs/config";
export declare function getStorageConfig(config: ConfigService): {
    enableEfs: boolean;
    defaultEnabled: boolean;
    posixUid: number;
    posixGid: number;
    rootPermissions: string;
    rootDirectoryBase: string;
    performanceMode: string;
    throughputMode: string;
    transitionToIa: string;
    backupEnabled: boolean;
    backupRetentionDays: number;
    backupSchedule: string;
    awsRegion: string;
};
