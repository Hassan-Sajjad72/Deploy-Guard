"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FinopsModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const audit_log_module_1 = require("../audit-log/audit-log.module");
const project_detection_profile_entity_1 = require("../projects/project-detection-profile.entity");
const project_pipeline_event_entity_1 = require("../projects/project-pipeline-event.entity");
const project_pipeline_run_entity_1 = require("../projects/project-pipeline-run.entity");
const project_preflight_report_entity_1 = require("../projects/project-preflight-report.entity");
const project_entity_1 = require("../projects/project.entity");
const project_persistent_storage_entity_1 = require("../storage/project-persistent-storage.entity");
const finops_controller_1 = require("./finops.controller");
const finops_policy_service_1 = require("./finops-policy.service");
const finops_service_1 = require("./finops.service");
const infracost_service_1 = require("./infracost.service");
const project_cost_estimate_entity_1 = require("./project-cost-estimate.entity");
const project_cost_resource_breakdown_entity_1 = require("./project-cost-resource-breakdown.entity");
const project_cost_settings_entity_1 = require("./project-cost-settings.entity");
const terraform_cost_plan_service_1 = require("./terraform-cost-plan.service");
let FinopsModule = class FinopsModule {
};
exports.FinopsModule = FinopsModule;
exports.FinopsModule = FinopsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                project_entity_1.Project,
                project_detection_profile_entity_1.ProjectDetectionProfile,
                project_preflight_report_entity_1.ProjectPreflightReport,
                project_pipeline_run_entity_1.ProjectPipelineRun,
                project_pipeline_event_entity_1.ProjectPipelineEvent,
                project_cost_estimate_entity_1.ProjectCostEstimate,
                project_cost_resource_breakdown_entity_1.ProjectCostResourceBreakdown,
                project_cost_settings_entity_1.ProjectCostSettings,
                project_persistent_storage_entity_1.ProjectPersistentStorage,
            ]),
            audit_log_module_1.AuditLogModule,
        ],
        controllers: [finops_controller_1.FinopsController],
        providers: [
            finops_service_1.FinopsService,
            finops_policy_service_1.FinopsPolicyService,
            infracost_service_1.InfracostService,
            terraform_cost_plan_service_1.TerraformCostPlanService,
        ],
        exports: [finops_service_1.FinopsService],
    })
], FinopsModule);
//# sourceMappingURL=finops.module.js.map