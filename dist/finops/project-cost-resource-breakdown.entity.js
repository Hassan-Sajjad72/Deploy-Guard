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
exports.ProjectCostResourceBreakdown = exports.CostResourceType = void 0;
const typeorm_1 = require("typeorm");
const project_pipeline_run_entity_1 = require("../projects/project-pipeline-run.entity");
const project_entity_1 = require("../projects/project.entity");
const decimal_transformer_1 = require("./decimal.transformer");
const project_cost_estimate_entity_1 = require("./project-cost-estimate.entity");
var CostResourceType;
(function (CostResourceType) {
    CostResourceType["ECS_FARGATE_COMPUTE"] = "ecs_fargate_compute";
    CostResourceType["LOAD_BALANCER"] = "load_balancer";
    CostResourceType["DATABASE"] = "database";
    CostResourceType["STORAGE"] = "storage";
    CostResourceType["DATA_TRANSFER"] = "data_transfer";
    CostResourceType["CLOUDWATCH_LOGS"] = "cloudwatch_logs";
    CostResourceType["NAT_GATEWAY"] = "nat_gateway";
    CostResourceType["OTHER"] = "other";
})(CostResourceType || (exports.CostResourceType = CostResourceType = {}));
let ProjectCostResourceBreakdown = class ProjectCostResourceBreakdown {
};
exports.ProjectCostResourceBreakdown = ProjectCostResourceBreakdown;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)("uuid"),
    __metadata("design:type", String)
], ProjectCostResourceBreakdown.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.Column)({ name: "estimate_id" }),
    __metadata("design:type", String)
], ProjectCostResourceBreakdown.prototype, "estimateId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => project_cost_estimate_entity_1.ProjectCostEstimate, (estimate) => estimate.breakdowns, {
        nullable: false,
        onDelete: "CASCADE",
    }),
    (0, typeorm_1.JoinColumn)({ name: "estimate_id" }),
    __metadata("design:type", project_cost_estimate_entity_1.ProjectCostEstimate)
], ProjectCostResourceBreakdown.prototype, "estimate", void 0);
__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.Column)({ name: "project_id" }),
    __metadata("design:type", String)
], ProjectCostResourceBreakdown.prototype, "projectId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => project_entity_1.Project, { nullable: false, onDelete: "CASCADE" }),
    (0, typeorm_1.JoinColumn)({ name: "project_id" }),
    __metadata("design:type", project_entity_1.Project)
], ProjectCostResourceBreakdown.prototype, "project", void 0);
__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.Column)({ nullable: true, name: "pipeline_run_id" }),
    __metadata("design:type", String)
], ProjectCostResourceBreakdown.prototype, "pipelineRunId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => project_pipeline_run_entity_1.ProjectPipelineRun, { nullable: true, onDelete: "SET NULL" }),
    (0, typeorm_1.JoinColumn)({ name: "pipeline_run_id" }),
    __metadata("design:type", project_pipeline_run_entity_1.ProjectPipelineRun)
], ProjectCostResourceBreakdown.prototype, "pipelineRun", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "resource_type" }),
    __metadata("design:type", String)
], ProjectCostResourceBreakdown.prototype, "resourceType", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "resource_name" }),
    __metadata("design:type", String)
], ProjectCostResourceBreakdown.prototype, "resourceName", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: "aws" }),
    __metadata("design:type", String)
], ProjectCostResourceBreakdown.prototype, "provider", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, name: "service_name" }),
    __metadata("design:type", String)
], ProjectCostResourceBreakdown.prototype, "serviceName", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "monthly_cost", type: "numeric", precision: 12, scale: 2, default: 0, transformer: decimal_transformer_1.decimalTransformer }),
    __metadata("design:type", Number)
], ProjectCostResourceBreakdown.prototype, "monthlyCost", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, name: "hourly_cost", type: "numeric", precision: 12, scale: 4, transformer: decimal_transformer_1.decimalTransformer }),
    __metadata("design:type", Number)
], ProjectCostResourceBreakdown.prototype, "hourlyCost", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], ProjectCostResourceBreakdown.prototype, "unit", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, type: "numeric", precision: 12, scale: 2, transformer: decimal_transformer_1.decimalTransformer }),
    __metadata("design:type", Number)
], ProjectCostResourceBreakdown.prototype, "quantity", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, type: "jsonb" }),
    __metadata("design:type", Object)
], ProjectCostResourceBreakdown.prototype, "metadata", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: "created_at" }),
    __metadata("design:type", Date)
], ProjectCostResourceBreakdown.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: "updated_at" }),
    __metadata("design:type", Date)
], ProjectCostResourceBreakdown.prototype, "updatedAt", void 0);
exports.ProjectCostResourceBreakdown = ProjectCostResourceBreakdown = __decorate([
    (0, typeorm_1.Entity)("project_cost_resource_breakdowns")
], ProjectCostResourceBreakdown);
//# sourceMappingURL=project-cost-resource-breakdown.entity.js.map