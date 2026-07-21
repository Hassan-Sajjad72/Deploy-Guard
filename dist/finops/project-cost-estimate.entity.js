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
exports.ProjectCostEstimate = exports.CostEstimateSource = exports.CostEstimateStatus = void 0;
const typeorm_1 = require("typeorm");
const project_pipeline_run_entity_1 = require("../projects/project-pipeline-run.entity");
const project_entity_1 = require("../projects/project.entity");
const user_entity_1 = require("../users/user.entity");
const decimal_transformer_1 = require("./decimal.transformer");
const project_cost_resource_breakdown_entity_1 = require("./project-cost-resource-breakdown.entity");
var CostEstimateStatus;
(function (CostEstimateStatus) {
    CostEstimateStatus["PENDING"] = "pending";
    CostEstimateStatus["CALCULATING"] = "calculating";
    CostEstimateStatus["NO_APPROVAL_REQUIRED"] = "no_approval_required";
    CostEstimateStatus["APPROVAL_REQUIRED"] = "approval_required";
    CostEstimateStatus["APPROVED"] = "approved";
    CostEstimateStatus["REJECTED"] = "rejected";
    CostEstimateStatus["BLOCKED_BY_TIER_LIMIT"] = "blocked_by_tier_limit";
    CostEstimateStatus["FAILED"] = "failed";
})(CostEstimateStatus || (exports.CostEstimateStatus = CostEstimateStatus = {}));
var CostEstimateSource;
(function (CostEstimateSource) {
    CostEstimateSource["MOCK"] = "mock";
    CostEstimateSource["INFRACOST"] = "infracost";
})(CostEstimateSource || (exports.CostEstimateSource = CostEstimateSource = {}));
let ProjectCostEstimate = class ProjectCostEstimate {
};
exports.ProjectCostEstimate = ProjectCostEstimate;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)("uuid"),
    __metadata("design:type", String)
], ProjectCostEstimate.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.Column)({ name: "project_id" }),
    __metadata("design:type", String)
], ProjectCostEstimate.prototype, "projectId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => project_entity_1.Project, { nullable: false, onDelete: "CASCADE" }),
    (0, typeorm_1.JoinColumn)({ name: "project_id" }),
    __metadata("design:type", project_entity_1.Project)
], ProjectCostEstimate.prototype, "project", void 0);
__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.Column)({ nullable: true, name: "pipeline_run_id" }),
    __metadata("design:type", String)
], ProjectCostEstimate.prototype, "pipelineRunId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => project_pipeline_run_entity_1.ProjectPipelineRun, { nullable: true, onDelete: "SET NULL" }),
    (0, typeorm_1.JoinColumn)({ name: "pipeline_run_id" }),
    __metadata("design:type", project_pipeline_run_entity_1.ProjectPipelineRun)
], ProjectCostEstimate.prototype, "pipelineRun", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, name: "created_by_user_id" }),
    __metadata("design:type", Number)
], ProjectCostEstimate.prototype, "createdByUserId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { nullable: true, onDelete: "SET NULL" }),
    (0, typeorm_1.JoinColumn)({ name: "created_by_user_id" }),
    __metadata("design:type", user_entity_1.User)
], ProjectCostEstimate.prototype, "createdByUser", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "enum", enum: CostEstimateStatus, default: CostEstimateStatus.PENDING }),
    __metadata("design:type", String)
], ProjectCostEstimate.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "enum", enum: CostEstimateSource }),
    __metadata("design:type", String)
], ProjectCostEstimate.prototype, "source", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: "USD" }),
    __metadata("design:type", String)
], ProjectCostEstimate.prototype, "currency", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "total_monthly_cost", type: "numeric", precision: 12, scale: 2, default: 0, transformer: decimal_transformer_1.decimalTransformer }),
    __metadata("design:type", Number)
], ProjectCostEstimate.prototype, "totalMonthlyCost", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, name: "previous_monthly_cost", type: "numeric", precision: 12, scale: 2, transformer: decimal_transformer_1.decimalTransformer }),
    __metadata("design:type", Number)
], ProjectCostEstimate.prototype, "previousMonthlyCost", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, name: "monthly_cost_difference", type: "numeric", precision: 12, scale: 2, transformer: decimal_transformer_1.decimalTransformer }),
    __metadata("design:type", Number)
], ProjectCostEstimate.prototype, "monthlyCostDifference", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, name: "tier_limit_monthly_cost", type: "numeric", precision: 12, scale: 2, transformer: decimal_transformer_1.decimalTransformer }),
    __metadata("design:type", Number)
], ProjectCostEstimate.prototype, "tierLimitMonthlyCost", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, name: "warning_threshold_monthly_cost", type: "numeric", precision: 12, scale: 2, transformer: decimal_transformer_1.decimalTransformer }),
    __metadata("design:type", Number)
], ProjectCostEstimate.prototype, "warningThresholdMonthlyCost", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "subscription_tier" }),
    __metadata("design:type", String)
], ProjectCostEstimate.prototype, "subscriptionTier", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false, name: "approval_required" }),
    __metadata("design:type", Boolean)
], ProjectCostEstimate.prototype, "approvalRequired", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false, name: "blocked_by_tier_limit" }),
    __metadata("design:type", Boolean)
], ProjectCostEstimate.prototype, "blockedByTierLimit", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, name: "upgrade_prompt_message", type: "text" }),
    __metadata("design:type", String)
], ProjectCostEstimate.prototype, "upgradePromptMessage", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, name: "terraform_plan_summary", type: "jsonb" }),
    __metadata("design:type", Object)
], ProjectCostEstimate.prototype, "terraformPlanSummary", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, name: "raw_infracost_response", type: "jsonb" }),
    __metadata("design:type", Object)
], ProjectCostEstimate.prototype, "rawInfracostResponse", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, name: "normalized_breakdown", type: "jsonb" }),
    __metadata("design:type", Object)
], ProjectCostEstimate.prototype, "normalizedBreakdown", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, type: "jsonb" }),
    __metadata("design:type", Object)
], ProjectCostEstimate.prototype, "metadata", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, name: "error_message", type: "text" }),
    __metadata("design:type", String)
], ProjectCostEstimate.prototype, "errorMessage", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, name: "approved_by_user_id" }),
    __metadata("design:type", Number)
], ProjectCostEstimate.prototype, "approvedByUserId", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, name: "approved_at", type: "timestamp" }),
    __metadata("design:type", Date)
], ProjectCostEstimate.prototype, "approvedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, name: "rejected_by_user_id" }),
    __metadata("design:type", Number)
], ProjectCostEstimate.prototype, "rejectedByUserId", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, name: "rejected_at", type: "timestamp" }),
    __metadata("design:type", Date)
], ProjectCostEstimate.prototype, "rejectedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, name: "rejection_reason", type: "text" }),
    __metadata("design:type", String)
], ProjectCostEstimate.prototype, "rejectionReason", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => project_cost_resource_breakdown_entity_1.ProjectCostResourceBreakdown, (breakdown) => breakdown.estimate),
    __metadata("design:type", Array)
], ProjectCostEstimate.prototype, "breakdowns", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: "created_at" }),
    __metadata("design:type", Date)
], ProjectCostEstimate.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: "updated_at" }),
    __metadata("design:type", Date)
], ProjectCostEstimate.prototype, "updatedAt", void 0);
exports.ProjectCostEstimate = ProjectCostEstimate = __decorate([
    (0, typeorm_1.Entity)("project_cost_estimates")
], ProjectCostEstimate);
//# sourceMappingURL=project-cost-estimate.entity.js.map