"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InfrastructureModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const audit_log_module_1 = require("../audit-log/audit-log.module");
const project_cost_estimate_entity_1 = require("../finops/project-cost-estimate.entity");
const project_detection_profile_entity_1 = require("../projects/project-detection-profile.entity");
const project_environment_variable_entity_1 = require("../projects/project-environment-variable.entity");
const project_pipeline_event_entity_1 = require("../projects/project-pipeline-event.entity");
const project_pipeline_run_entity_1 = require("../projects/project-pipeline-run.entity");
const project_preflight_report_entity_1 = require("../projects/project-preflight-report.entity");
const project_security_scan_entity_1 = require("../projects/project-security-scan.entity");
const pipeline_queue_1 = require("../projects/pipeline/pipeline.queue");
const project_entity_1 = require("../projects/project.entity");
const state_management_module_1 = require("../state-management/state-management.module");
const storage_module_1 = require("../storage/storage.module");
const infrastructure_controller_1 = require("./infrastructure.controller");
const infrastructure_readiness_service_1 = require("./infrastructure-readiness.service");
const infrastructure_service_1 = require("./infrastructure.service");
const project_deployment_readiness_snapshot_entity_1 = require("./project-deployment-readiness-snapshot.entity");
const project_infrastructure_environment_entity_1 = require("./project-infrastructure-environment.entity");
const project_infrastructure_event_entity_1 = require("./project-infrastructure-event.entity");
const project_service_discovery_record_entity_1 = require("./project-service-discovery-record.entity");
const service_discovery_service_1 = require("./service-discovery.service");
const terraform_runner_service_1 = require("./terraform-runner.service");
let InfrastructureModule = class InfrastructureModule {
};
exports.InfrastructureModule = InfrastructureModule;
exports.InfrastructureModule = InfrastructureModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                project_entity_1.Project,
                project_environment_variable_entity_1.ProjectEnvironmentVariable,
                project_detection_profile_entity_1.ProjectDetectionProfile,
                project_preflight_report_entity_1.ProjectPreflightReport,
                project_pipeline_run_entity_1.ProjectPipelineRun,
                project_pipeline_event_entity_1.ProjectPipelineEvent,
                project_security_scan_entity_1.ProjectSecurityScan,
                project_cost_estimate_entity_1.ProjectCostEstimate,
                project_infrastructure_environment_entity_1.ProjectInfrastructureEnvironment,
                project_infrastructure_event_entity_1.ProjectInfrastructureEvent,
                project_service_discovery_record_entity_1.ProjectServiceDiscoveryRecord,
                project_deployment_readiness_snapshot_entity_1.ProjectDeploymentReadinessSnapshot,
            ]),
            audit_log_module_1.AuditLogModule,
            state_management_module_1.StateManagementModule,
            storage_module_1.StorageModule,
        ],
        controllers: [infrastructure_controller_1.InfrastructureController],
        providers: [
            pipeline_queue_1.pipelineQueueProvider,
            infrastructure_service_1.InfrastructureService,
            infrastructure_readiness_service_1.InfrastructureReadinessService,
            terraform_runner_service_1.TerraformRunnerService,
            service_discovery_service_1.ServiceDiscoveryService,
        ],
        exports: [infrastructure_service_1.InfrastructureService, infrastructure_readiness_service_1.InfrastructureReadinessService],
    })
], InfrastructureModule);
//# sourceMappingURL=infrastructure.module.js.map