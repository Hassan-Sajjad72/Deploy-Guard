"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StateManagementModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const audit_log_module_1 = require("../audit-log/audit-log.module");
const project_infrastructure_environment_entity_1 = require("../infrastructure/project-infrastructure-environment.entity");
const project_pipeline_run_entity_1 = require("../projects/project-pipeline-run.entity");
const project_entity_1 = require("../projects/project.entity");
const aws_cli_service_1 = require("./aws-cli.service");
const orphaned_lock_monitor_service_1 = require("./orphaned-lock-monitor.service");
const project_deployment_queue_item_entity_1 = require("./project-deployment-queue-item.entity");
const project_state_recovery_request_entity_1 = require("./project-state-recovery-request.entity");
const project_state_validation_result_entity_1 = require("./project-state-validation-result.entity");
const project_terraform_lock_entity_1 = require("./project-terraform-lock.entity");
const project_terraform_state_entity_1 = require("./project-terraform-state.entity");
const state_corruption_service_1 = require("./state-corruption.service");
const state_heartbeat_service_1 = require("./state-heartbeat.service");
const state_lock_service_1 = require("./state-lock.service");
const state_management_controller_1 = require("./state-management.controller");
const state_management_service_1 = require("./state-management.service");
const state_recovery_service_1 = require("./state-recovery.service");
const terraform_state_service_1 = require("./terraform-state.service");
let StateManagementModule = class StateManagementModule {
};
exports.StateManagementModule = StateManagementModule;
exports.StateManagementModule = StateManagementModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                project_entity_1.Project,
                project_pipeline_run_entity_1.ProjectPipelineRun,
                project_infrastructure_environment_entity_1.ProjectInfrastructureEnvironment,
                project_terraform_state_entity_1.ProjectTerraformState,
                project_terraform_lock_entity_1.ProjectTerraformLock,
                project_deployment_queue_item_entity_1.ProjectDeploymentQueueItem,
                project_state_validation_result_entity_1.ProjectStateValidationResult,
                project_state_recovery_request_entity_1.ProjectStateRecoveryRequest,
            ]),
            audit_log_module_1.AuditLogModule,
        ],
        controllers: [state_management_controller_1.StateManagementController],
        providers: [
            aws_cli_service_1.AwsCliService,
            terraform_state_service_1.TerraformStateService,
            state_lock_service_1.StateLockService,
            state_heartbeat_service_1.StateHeartbeatService,
            orphaned_lock_monitor_service_1.OrphanedLockMonitorService,
            state_corruption_service_1.StateCorruptionService,
            state_recovery_service_1.StateRecoveryService,
            state_management_service_1.StateManagementService,
        ],
        exports: [
            terraform_state_service_1.TerraformStateService,
            state_lock_service_1.StateLockService,
            state_heartbeat_service_1.StateHeartbeatService,
            orphaned_lock_monitor_service_1.OrphanedLockMonitorService,
            state_corruption_service_1.StateCorruptionService,
            state_recovery_service_1.StateRecoveryService,
        ],
    })
], StateManagementModule);
//# sourceMappingURL=state-management.module.js.map