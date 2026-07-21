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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectPersistentStorage = exports.PersistentStorageType = exports.PersistentStorageStatus = void 0;
const typeorm_1 = require("typeorm");
const project_infrastructure_environment_entity_1 = require("../infrastructure/project-infrastructure-environment.entity");
const project_pipeline_run_entity_1 = require("../projects/project-pipeline-run.entity");
const project_entity_1 = require("../projects/project.entity");
var PersistentStorageStatus;
(function (PersistentStorageStatus) {
    PersistentStorageStatus["NOT_REQUIRED"] = "not_required";
    PersistentStorageStatus["RECOMMENDED"] = "recommended";
    PersistentStorageStatus["PENDING"] = "pending";
    PersistentStorageStatus["PROVISIONING"] = "provisioning";
    PersistentStorageStatus["PROVISIONED"] = "provisioned";
    PersistentStorageStatus["FAILED"] = "failed";
    PersistentStorageStatus["BACKUP_CONFIGURED"] = "backup_configured";
    PersistentStorageStatus["RESTORE_PENDING"] = "restore_pending";
    PersistentStorageStatus["RESTORED"] = "restored";
})(PersistentStorageStatus || (exports.PersistentStorageStatus = PersistentStorageStatus = {}));
var PersistentStorageType;
(function (PersistentStorageType) {
    PersistentStorageType["EFS"] = "efs";
})(PersistentStorageType || (exports.PersistentStorageType = PersistentStorageType = {}));
let ProjectPersistentStorage = class ProjectPersistentStorage {
};
exports.ProjectPersistentStorage = ProjectPersistentStorage;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)("uuid"),
    __metadata("design:type", String)
], ProjectPersistentStorage.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.Column)({ name: "project_id" }),
    __metadata("design:type", String)
], ProjectPersistentStorage.prototype, "projectId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => project_entity_1.Project, { nullable: false, onDelete: "CASCADE" }),
    (0, typeorm_1.JoinColumn)({ name: "project_id" }),
    __metadata("design:type", project_entity_1.Project)
], ProjectPersistentStorage.prototype, "project", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, name: "infrastructure_environment_id" }),
    __metadata("design:type", String)
], ProjectPersistentStorage.prototype, "infrastructureEnvironmentId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => project_infrastructure_environment_entity_1.ProjectInfrastructureEnvironment, { nullable: true, onDelete: "SET NULL" }),
    (0, typeorm_1.JoinColumn)({ name: "infrastructure_environment_id" }),
    __metadata("design:type", project_infrastructure_environment_entity_1.ProjectInfrastructureEnvironment)
], ProjectPersistentStorage.prototype, "infrastructureEnvironment", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, name: "pipeline_run_id" }),
    __metadata("design:type", String)
], ProjectPersistentStorage.prototype, "pipelineRunId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => project_pipeline_run_entity_1.ProjectPipelineRun, { nullable: true, onDelete: "SET NULL" }),
    (0, typeorm_1.JoinColumn)({ name: "pipeline_run_id" }),
    __metadata("design:type", project_pipeline_run_entity_1.ProjectPipelineRun)
], ProjectPersistentStorage.prototype, "pipelineRun", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: "dev", name: "environment_name" }),
    __metadata("design:type", String)
], ProjectPersistentStorage.prototype, "environmentName", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], ProjectPersistentStorage.prototype, "enabled", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false, name: "required_by_detection" }),
    __metadata("design:type", Boolean)
], ProjectPersistentStorage.prototype, "requiredByDetection", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false, name: "user_enabled" }),
    __metadata("design:type", Boolean)
], ProjectPersistentStorage.prototype, "userEnabled", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: PersistentStorageStatus.NOT_REQUIRED }),
    __metadata("design:type", String)
], ProjectPersistentStorage.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: PersistentStorageType.EFS, name: "storage_type" }),
    __metadata("design:type", String)
], ProjectPersistentStorage.prototype, "storageType", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, name: "aws_region" }),
    __metadata("design:type", String)
], ProjectPersistentStorage.prototype, "awsRegion", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, name: "efs_file_system_id" }),
    __metadata("design:type", String)
], ProjectPersistentStorage.prototype, "efsFileSystemId", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, name: "efs_file_system_arn" }),
    __metadata("design:type", String)
], ProjectPersistentStorage.prototype, "efsFileSystemArn", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, name: "efs_dns_name" }),
    __metadata("design:type", String)
], ProjectPersistentStorage.prototype, "efsDnsName", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, name: "efs_access_point_id" }),
    __metadata("design:type", String)
], ProjectPersistentStorage.prototype, "efsAccessPointId", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, name: "efs_access_point_arn" }),
    __metadata("design:type", String)
], ProjectPersistentStorage.prototype, "efsAccessPointArn", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, name: "efs_security_group_id" }),
    __metadata("design:type", String)
], ProjectPersistentStorage.prototype, "efsSecurityGroupId", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, name: "kms_key_id" }),
    __metadata("design:type", String)
], ProjectPersistentStorage.prototype, "kmsKeyId", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, name: "kms_key_arn" }),
    __metadata("design:type", String)
], ProjectPersistentStorage.prototype, "kmsKeyArn", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, name: "mount_target_ids", type: "jsonb" }),
    __metadata("design:type", Array)
], ProjectPersistentStorage.prototype, "mountTargetIds", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, name: "root_directory" }),
    __metadata("design:type", String)
], ProjectPersistentStorage.prototype, "rootDirectory", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 1000, name: "posix_uid" }),
    __metadata("design:type", Number)
], ProjectPersistentStorage.prototype, "posixUid", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 1000, name: "posix_gid" }),
    __metadata("design:type", Number)
], ProjectPersistentStorage.prototype, "posixGid", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: "750", name: "root_permissions" }),
    __metadata("design:type", String)
], ProjectPersistentStorage.prototype, "rootPermissions", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: true }),
    __metadata("design:type", Boolean)
], ProjectPersistentStorage.prototype, "encrypted", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: true, name: "backup_enabled" }),
    __metadata("design:type", Boolean)
], ProjectPersistentStorage.prototype, "backupEnabled", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, name: "backup_vault_name" }),
    __metadata("design:type", String)
], ProjectPersistentStorage.prototype, "backupVaultName", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, name: "backup_plan_id" }),
    __metadata("design:type", String)
], ProjectPersistentStorage.prototype, "backupPlanId", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, name: "backup_retention_days" }),
    __metadata("design:type", Number)
], ProjectPersistentStorage.prototype, "backupRetentionDays", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, name: "ecs_mount_config", type: "jsonb" }),
    __metadata("design:type", Object)
], ProjectPersistentStorage.prototype, "ecsMountConfig", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, type: "jsonb" }),
    __metadata("design:type", Object)
], ProjectPersistentStorage.prototype, "metadata", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, name: "error_message", type: "text" }),
    __metadata("design:type", String)
], ProjectPersistentStorage.prototype, "errorMessage", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, name: "provisioned_at", type: "timestamp" }),
    __metadata("design:type", Date)
], ProjectPersistentStorage.prototype, "provisionedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, name: "failed_at", type: "timestamp" }),
    __metadata("design:type", Date)
], ProjectPersistentStorage.prototype, "failedAt", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: "created_at" }),
    __metadata("design:type", Date)
], ProjectPersistentStorage.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: "updated_at" }),
    __metadata("design:type", Date)
], ProjectPersistentStorage.prototype, "updatedAt", void 0);
exports.ProjectPersistentStorage = ProjectPersistentStorage = __decorate([
    (0, typeorm_1.Entity)("project_persistent_storage")
], ProjectPersistentStorage);
//# sourceMappingURL=project-persistent-storage.entity.js.map