"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectsModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const audit_log_module_1 = require("../audit-log/audit-log.module");
const finops_module_1 = require("../finops/finops.module");
const infrastructure_module_1 = require("../infrastructure/infrastructure.module");
const orchestration_module_1 = require("../orchestration/orchestration.module");
const observability_module_1 = require("../observability/observability.module");
const storage_module_1 = require("../storage/storage.module");
const deployment_profile_service_1 = require("./detection/deployment-profile.service");
const repository_workspace_service_1 = require("./detection/repository-workspace.service");
const stack_detection_service_1 = require("./detection/stack-detection.service");
const template_matching_service_1 = require("./detection/template-matching.service");
const project_environment_variable_entity_1 = require("./project-environment-variable.entity");
const project_detection_profile_entity_1 = require("./project-detection-profile.entity");
const project_preflight_report_entity_1 = require("./project-preflight-report.entity");
const project_pipeline_event_entity_1 = require("./project-pipeline-event.entity");
const project_pipeline_run_entity_1 = require("./project-pipeline-run.entity");
const project_security_finding_entity_1 = require("./project-security-finding.entity");
const project_security_scan_entity_1 = require("./project-security-scan.entity");
const project_entity_1 = require("./project.entity");
const projects_controller_1 = require("./projects.controller");
const projects_service_1 = require("./projects.service");
const docker_build_service_1 = require("./pipeline/docker-build.service");
const ecr_service_1 = require("./pipeline/ecr.service");
const github_actions_service_1 = require("./pipeline/github-actions.service");
const pipeline_service_1 = require("./pipeline/pipeline.service");
const pipeline_worker_service_1 = require("./pipeline/pipeline-worker.service");
const pipeline_queue_1 = require("./pipeline/pipeline.queue");
const terraform_service_1 = require("./pipeline/terraform.service");
const remediation_service_1 = require("./security/remediation.service");
const security_policy_service_1 = require("./security/security-policy.service");
const security_scan_service_1 = require("./security/security-scan.service");
const trivy_parser_service_1 = require("./security/trivy-parser.service");
const trivy_scanner_service_1 = require("./security/trivy-scanner.service");
const docker_template_engine_service_1 = require("./templates/docker-template-engine.service");
const preflight_service_1 = require("./templates/preflight.service");
const template_registry_service_1 = require("./templates/template-registry.service");
const templates_controller_1 = require("./templates/templates.controller");
const user_entity_1 = require("../users/user.entity");
let ProjectsModule = class ProjectsModule {
};
exports.ProjectsModule = ProjectsModule;
exports.ProjectsModule = ProjectsModule = __decorate([
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
                project_security_finding_entity_1.ProjectSecurityFinding,
                user_entity_1.User,
            ]),
            audit_log_module_1.AuditLogModule,
            finops_module_1.FinopsModule,
            infrastructure_module_1.InfrastructureModule,
            orchestration_module_1.OrchestrationModule,
            observability_module_1.ObservabilityModule,
            storage_module_1.StorageModule,
        ],
        controllers: [projects_controller_1.ProjectsController, templates_controller_1.TemplatesController],
        providers: [
            projects_service_1.ProjectsService,
            deployment_profile_service_1.DeploymentProfileService,
            repository_workspace_service_1.RepositoryWorkspaceService,
            stack_detection_service_1.StackDetectionService,
            template_matching_service_1.TemplateMatchingService,
            template_registry_service_1.TemplateRegistryService,
            docker_template_engine_service_1.DockerTemplateEngineService,
            preflight_service_1.PreflightService,
            pipeline_queue_1.pipelineQueueProvider,
            pipeline_service_1.PipelineService,
            pipeline_worker_service_1.PipelineWorkerService,
            github_actions_service_1.GithubActionsService,
            docker_build_service_1.DockerBuildService,
            ecr_service_1.EcrService,
            terraform_service_1.TerraformService,
            trivy_scanner_service_1.TrivyScannerService,
            trivy_parser_service_1.TrivyParserService,
            security_policy_service_1.SecurityPolicyService,
            remediation_service_1.RemediationService,
            security_scan_service_1.SecurityScanService,
        ],
    })
], ProjectsModule);
//# sourceMappingURL=projects.module.js.map