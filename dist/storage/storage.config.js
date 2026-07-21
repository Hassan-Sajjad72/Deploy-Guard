"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStorageConfig = getStorageConfig;
function getStorageConfig(config) {
    return {
        enableEfs: config.get("DEPLOYGUARD_ENABLE_EFS", "true") !== "false",
        defaultEnabled: config.get("DEPLOYGUARD_EFS_DEFAULT_ENABLED", "false") === "true",
        posixUid: Number(config.get("DEPLOYGUARD_EFS_POSIX_UID", "1000")),
        posixGid: Number(config.get("DEPLOYGUARD_EFS_POSIX_GID", "1000")),
        rootPermissions: config.get("DEPLOYGUARD_EFS_ROOT_PERMISSIONS", "750"),
        rootDirectoryBase: config.get("DEPLOYGUARD_EFS_ROOT_DIRECTORY_BASE", "/deployguard"),
        performanceMode: config.get("DEPLOYGUARD_EFS_PERFORMANCE_MODE", "generalPurpose"),
        throughputMode: config.get("DEPLOYGUARD_EFS_THROUGHPUT_MODE", "bursting"),
        transitionToIa: config.get("DEPLOYGUARD_EFS_TRANSITION_TO_IA", "AFTER_30_DAYS"),
        backupEnabled: config.get("DEPLOYGUARD_EFS_ENABLE_BACKUP", "true") !== "false",
        backupRetentionDays: Number(config.get("DEPLOYGUARD_EFS_BACKUP_RETENTION_DAYS", "30")),
        backupSchedule: config.get("DEPLOYGUARD_EFS_BACKUP_SCHEDULE", "cron(0 3 * * ? *)"),
        awsRegion: config.get("AWS_REGION", "us-east-1"),
    };
}
//# sourceMappingURL=storage.config.js.map