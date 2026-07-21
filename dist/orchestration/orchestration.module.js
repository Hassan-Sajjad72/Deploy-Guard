"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrchestrationModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const audit_log_module_1 = require("../audit-log/audit-log.module");
const project_cost_estimate_entity_1 = require("../finops/project-cost-estimate.entity");
const infrastructure_module_1 = require("../infrastructure/infrastructure.module");
const project_infrastructure_environment_entity_1 = require("../infrastructure/project-infrastructure-environment.entity");
const project_pipeline_run_entity_1 = require("../projects/project-pipeline-run.entity");
const project_security_scan_entity_1 = require("../projects/project-security-scan.entity");
const project_entity_1 = require("../projects/project.entity");
const project_terraform_state_entity_1 = require("../state-management/project-terraform-state.entity");
const project_persistent_storage_entity_1 = require("../storage/project-persistent-storage.entity");
const alb_service_1 = require("./alb.service");
const autoscaling_service_1 = require("./autoscaling.service");
const deployment_readiness_service_1 = require("./deployment-readiness.service");
const ecs_service_1 = require("./ecs.service");
const orchestration_controller_1 = require("./orchestration.controller");
const orchestration_service_1 = require("./orchestration.service");
const project_deployment_entity_1 = require("./project-deployment.entity");
const project_orchestration_event_entity_1 = require("./project-orchestration-event.entity");
const project_rollback_record_entity_1 = require("./project-rollback-record.entity");
const project_spot_interruption_event_entity_1 = require("./project-spot-interruption-event.entity");
const project_stable_release_entity_1 = require("./project-stable-release.entity");
const rollback_service_1 = require("./rollback.service");
const spot_interruption_service_1 = require("./spot-interruption.service");
let OrchestrationModule = class OrchestrationModule {
};
exports.OrchestrationModule = OrchestrationModule;
exports.OrchestrationModule = OrchestrationModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                project_entity_1.Project,
                project_pipeline_run_entity_1.ProjectPipelineRun,
                project_security_scan_entity_1.ProjectSecurityScan,
                project_cost_estimate_entity_1.ProjectCostEstimate,
                project_infrastructure_environment_entity_1.ProjectInfrastructureEnvironment,
                project_terraform_state_entity_1.ProjectTerraformState,
                project_persistent_storage_entity_1.ProjectPersistentStorage,
                project_deployment_entity_1.ProjectDeployment,
                project_stable_release_entity_1.ProjectStableRelease,
                project_orchestration_event_entity_1.ProjectOrchestrationEvent,
                project_spot_interruption_event_entity_1.ProjectSpotInterruptionEvent,
                project_rollback_record_entity_1.ProjectRollbackRecord,
            ]),
            audit_log_module_1.AuditLogModule,
            infrastructure_module_1.InfrastructureModule,
        ],
        controllers: [orchestration_controller_1.OrchestrationController],
        providers: [
            orchestration_service_1.OrchestrationService,
            ecs_service_1.EcsService,
            alb_service_1.AlbService,
            autoscaling_service_1.AutoscalingService,
            rollback_service_1.RollbackService,
            spot_interruption_service_1.SpotInterruptionService,
            deployment_readiness_service_1.OrchestrationDeploymentReadinessService,
        ],
        exports: [
            orchestration_service_1.OrchestrationService,
            ecs_service_1.EcsService,
            alb_service_1.AlbService,
            autoscaling_service_1.AutoscalingService,
            rollback_service_1.RollbackService,
            spot_interruption_service_1.SpotInterruptionService,
        ],
    })
], OrchestrationModule);
//# sourceMappingURL=orchestration.module.js.map