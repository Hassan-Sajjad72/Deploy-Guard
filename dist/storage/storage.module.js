"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StorageModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const audit_log_module_1 = require("../audit-log/audit-log.module");
const project_infrastructure_environment_entity_1 = require("../infrastructure/project-infrastructure-environment.entity");
const project_detection_profile_entity_1 = require("../projects/project-detection-profile.entity");
const project_pipeline_run_entity_1 = require("../projects/project-pipeline-run.entity");
const pipeline_queue_1 = require("../projects/pipeline/pipeline.queue");
const project_entity_1 = require("../projects/project.entity");
const backup_service_1 = require("./backup.service");
const efs_service_1 = require("./efs.service");
const project_backup_record_entity_1 = require("./project-backup-record.entity");
const project_persistent_storage_entity_1 = require("./project-persistent-storage.entity");
const project_storage_event_entity_1 = require("./project-storage-event.entity");
const project_storage_restore_request_entity_1 = require("./project-storage-restore-request.entity");
const storage_controller_1 = require("./storage.controller");
const storage_policy_service_1 = require("./storage-policy.service");
const storage_service_1 = require("./storage.service");
let StorageModule = class StorageModule {
};
exports.StorageModule = StorageModule;
exports.StorageModule = StorageModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                project_entity_1.Project,
                project_detection_profile_entity_1.ProjectDetectionProfile,
                project_pipeline_run_entity_1.ProjectPipelineRun,
                project_infrastructure_environment_entity_1.ProjectInfrastructureEnvironment,
                project_persistent_storage_entity_1.ProjectPersistentStorage,
                project_storage_event_entity_1.ProjectStorageEvent,
                project_backup_record_entity_1.ProjectBackupRecord,
                project_storage_restore_request_entity_1.ProjectStorageRestoreRequest,
            ]),
            audit_log_module_1.AuditLogModule,
        ],
        controllers: [storage_controller_1.StorageController],
        providers: [
            pipeline_queue_1.pipelineQueueProvider,
            storage_service_1.StorageService,
            storage_policy_service_1.StoragePolicyService,
            efs_service_1.EfsService,
            backup_service_1.BackupService,
        ],
        exports: [storage_service_1.StorageService, storage_policy_service_1.StoragePolicyService, efs_service_1.EfsService, backup_service_1.BackupService],
    })
], StorageModule);
//# sourceMappingURL=storage.module.js.map