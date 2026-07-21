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
exports.ProjectInfrastructureEnvironment = exports.InfrastructureEnvironmentStatus = void 0;
const typeorm_1 = require("typeorm");
const project_pipeline_run_entity_1 = require("../projects/project-pipeline-run.entity");
const project_entity_1 = require("../projects/project.entity");
var InfrastructureEnvironmentStatus;
(function (InfrastructureEnvironmentStatus) {
    InfrastructureEnvironmentStatus["NOT_PROVISIONED"] = "not_provisioned";
    InfrastructureEnvironmentStatus["READINESS_FAILED"] = "readiness_failed";
    InfrastructureEnvironmentStatus["QUEUED"] = "queued";
    InfrastructureEnvironmentStatus["PLANNING"] = "planning";
    InfrastructureEnvironmentStatus["PLAN_FAILED"] = "plan_failed";
    InfrastructureEnvironmentStatus["COST_CHECK_REQUIRED"] = "cost_check_required";
    InfrastructureEnvironmentStatus["WAITING_FOR_COST_APPROVAL"] = "waiting_for_cost_approval";
    InfrastructureEnvironmentStatus["PROVISIONING"] = "provisioning";
    InfrastructureEnvironmentStatus["PROVISIONED"] = "provisioned";
    InfrastructureEnvironmentStatus["FAILED"] = "failed";
    InfrastructureEnvironmentStatus["PARTIALLY_PROVISIONED"] = "partially_provisioned";
    InfrastructureEnvironmentStatus["DESTROYED"] = "destroyed";
})(InfrastructureEnvironmentStatus || (exports.InfrastructureEnvironmentStatus = InfrastructureEnvironmentStatus = {}));
let ProjectInfrastructureEnvironment = class ProjectInfrastructureEnvironment {
};
exports.ProjectInfrastructureEnvironment = ProjectInfrastructureEnvironment;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)("uuid"),
    __metadata("design:type", String)
], ProjectInfrastructureEnvironment.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.Column)({ name: "project_id" }),
    __metadata("design:type", String)
], ProjectInfrastructureEnvironment.prototype, "projectId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => project_entity_1.Project, { nullable: false, onDelete: "CASCADE" }),
    (0, typeorm_1.JoinColumn)({ name: "project_id" }),
    __metadata("design:type", project_entity_1.Project)
], ProjectInfrastructureEnvironment.prototype, "project", void 0);
__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.Column)({ nullable: true, name: "pipeline_run_id" }),
    __metadata("design:type", String)
], ProjectInfrastructureEnvironment.prototype, "pipelineRunId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => project_pipeline_run_entity_1.ProjectPipelineRun, { nullable: true, onDelete: "SET NULL" }),
    (0, typeorm_1.JoinColumn)({ name: "pipeline_run_id" }),
    __metadata("design:type", project_pipeline_run_entity_1.ProjectPipelineRun)
], ProjectInfrastructureEnvironment.prototype, "pipelineRun", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: "dev", name: "environment_name" }),
    __metadata("design:type", String)
], ProjectInfrastructureEnvironment.prototype, "environmentName", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: InfrastructureEnvironmentStatus.NOT_PROVISIONED }),
    __metadata("design:type", String)
], ProjectInfrastructureEnvironment.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, name: "aws_region" }),
    __metadata("design:type", String)
], ProjectInfrastructureEnvironment.prototype, "awsRegion", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, name: "vpc_id" }),
    __metadata("design:type", String)
], ProjectInfrastructureEnvironment.prototype, "vpcId", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, name: "public_subnet_ids", type: "jsonb" }),
    __metadata("design:type", Array)
], ProjectInfrastructureEnvironment.prototype, "publicSubnetIds", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, name: "private_subnet_ids", type: "jsonb" }),
    __metadata("design:type", Array)
], ProjectInfrastructureEnvironment.prototype, "privateSubnetIds", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, name: "internet_gateway_id" }),
    __metadata("design:type", String)
], ProjectInfrastructureEnvironment.prototype, "internetGatewayId", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, name: "nat_gateway_ids", type: "jsonb" }),
    __metadata("design:type", Array)
], ProjectInfrastructureEnvironment.prototype, "natGatewayIds", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, name: "route_table_ids", type: "jsonb" }),
    __metadata("design:type", Object)
], ProjectInfrastructureEnvironment.prototype, "routeTableIds", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, name: "alb_security_group_id" }),
    __metadata("design:type", String)
], ProjectInfrastructureEnvironment.prototype, "albSecurityGroupId", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, name: "app_security_group_id" }),
    __metadata("design:type", String)
], ProjectInfrastructureEnvironment.prototype, "appSecurityGroupId", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, name: "internal_security_group_id" }),
    __metadata("design:type", String)
], ProjectInfrastructureEnvironment.prototype, "internalSecurityGroupId", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, name: "cloud_map_namespace_id" }),
    __metadata("design:type", String)
], ProjectInfrastructureEnvironment.prototype, "cloudMapNamespaceId", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, name: "cloud_map_namespace_name" }),
    __metadata("design:type", String)
], ProjectInfrastructureEnvironment.prototype, "cloudMapNamespaceName", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, name: "cloud_map_service_discovery_domain" }),
    __metadata("design:type", String)
], ProjectInfrastructureEnvironment.prototype, "cloudMapServiceDiscoveryDomain", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, name: "terraform_workspace_path" }),
    __metadata("design:type", String)
], ProjectInfrastructureEnvironment.prototype, "terraformWorkspacePath", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, name: "terraform_state_key" }),
    __metadata("design:type", String)
], ProjectInfrastructureEnvironment.prototype, "terraformStateKey", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, name: "terraform_plan_summary", type: "jsonb" }),
    __metadata("design:type", Object)
], ProjectInfrastructureEnvironment.prototype, "terraformPlanSummary", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, name: "terraform_outputs", type: "jsonb" }),
    __metadata("design:type", Object)
], ProjectInfrastructureEnvironment.prototype, "terraformOutputs", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, name: "readiness_snapshot", type: "jsonb" }),
    __metadata("design:type", Object)
], ProjectInfrastructureEnvironment.prototype, "readinessSnapshot", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, type: "jsonb" }),
    __metadata("design:type", Object)
], ProjectInfrastructureEnvironment.prototype, "metadata", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, name: "error_message", type: "text" }),
    __metadata("design:type", String)
], ProjectInfrastructureEnvironment.prototype, "errorMessage", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, name: "provisioned_at", type: "timestamp" }),
    __metadata("design:type", Date)
], ProjectInfrastructureEnvironment.prototype, "provisionedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, name: "failed_at", type: "timestamp" }),
    __metadata("design:type", Date)
], ProjectInfrastructureEnvironment.prototype, "failedAt", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: "created_at" }),
    __metadata("design:type", Date)
], ProjectInfrastructureEnvironment.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: "updated_at" }),
    __metadata("design:type", Date)
], ProjectInfrastructureEnvironment.prototype, "updatedAt", void 0);
exports.ProjectInfrastructureEnvironment = ProjectInfrastructureEnvironment = __decorate([
    (0, typeorm_1.Entity)("project_infrastructure_environments")
], ProjectInfrastructureEnvironment);
//# sourceMappingURL=project-infrastructure-environment.entity.js.map