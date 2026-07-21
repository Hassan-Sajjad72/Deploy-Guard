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
exports.ProjectCostSettings = exports.SubscriptionTier = void 0;
const typeorm_1 = require("typeorm");
const project_entity_1 = require("../projects/project.entity");
const user_entity_1 = require("../users/user.entity");
const decimal_transformer_1 = require("./decimal.transformer");
var SubscriptionTier;
(function (SubscriptionTier) {
    SubscriptionTier["FREE"] = "free";
    SubscriptionTier["STARTER"] = "starter";
    SubscriptionTier["PRO"] = "pro";
    SubscriptionTier["ENTERPRISE"] = "enterprise";
})(SubscriptionTier || (exports.SubscriptionTier = SubscriptionTier = {}));
let ProjectCostSettings = class ProjectCostSettings {
};
exports.ProjectCostSettings = ProjectCostSettings;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)("uuid"),
    __metadata("design:type", String)
], ProjectCostSettings.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.Column)({ name: "project_id" }),
    __metadata("design:type", String)
], ProjectCostSettings.prototype, "projectId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => project_entity_1.Project, { nullable: false, onDelete: "CASCADE" }),
    (0, typeorm_1.JoinColumn)({ name: "project_id" }),
    __metadata("design:type", project_entity_1.Project)
], ProjectCostSettings.prototype, "project", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "subscription_tier", type: "enum", enum: SubscriptionTier, default: SubscriptionTier.FREE }),
    __metadata("design:type", String)
], ProjectCostSettings.prototype, "subscriptionTier", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "warning_threshold_monthly_cost", type: "numeric", precision: 12, scale: 2, default: 25, transformer: decimal_transformer_1.decimalTransformer }),
    __metadata("design:type", Number)
], ProjectCostSettings.prototype, "warningThresholdMonthlyCost", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: "USD" }),
    __metadata("design:type", String)
], ProjectCostSettings.prototype, "currency", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, name: "updated_by_user_id" }),
    __metadata("design:type", Number)
], ProjectCostSettings.prototype, "updatedByUserId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { nullable: true, onDelete: "SET NULL" }),
    (0, typeorm_1.JoinColumn)({ name: "updated_by_user_id" }),
    __metadata("design:type", user_entity_1.User)
], ProjectCostSettings.prototype, "updatedByUser", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: "created_at" }),
    __metadata("design:type", Date)
], ProjectCostSettings.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: "updated_at" }),
    __metadata("design:type", Date)
], ProjectCostSettings.prototype, "updatedAt", void 0);
exports.ProjectCostSettings = ProjectCostSettings = __decorate([
    (0, typeorm_1.Entity)("project_cost_settings"),
    (0, typeorm_1.Unique)(["projectId"])
], ProjectCostSettings);
//# sourceMappingURL=project-cost-settings.entity.js.map