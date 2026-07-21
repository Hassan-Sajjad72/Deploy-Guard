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
exports.ProjectTerraformState = exports.TerraformStateStatus = void 0;
const typeorm_1 = require("typeorm");
const project_infrastructure_environment_entity_1 = require("../infrastructure/project-infrastructure-environment.entity");
const project_entity_1 = require("../projects/project.entity");
var TerraformStateStatus;
(function (TerraformStateStatus) {
    TerraformStateStatus["ACTIVE"] = "active";
    TerraformStateStatus["MISSING"] = "missing";
    TerraformStateStatus["CORRUPTED"] = "corrupted";
    TerraformStateStatus["RECOVERY_REQUIRED"] = "recovery_required";
    TerraformStateStatus["RECOVERED"] = "recovered";
    TerraformStateStatus["FAILED"] = "failed";
})(TerraformStateStatus || (exports.TerraformStateStatus = TerraformStateStatus = {}));
let ProjectTerraformState = class ProjectTerraformState {
};
exports.ProjectTerraformState = ProjectTerraformState;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)("uuid"),
    __metadata("design:type", String)
], ProjectTerraformState.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.Column)({ name: "project_id" }),
    __metadata("design:type", String)
], ProjectTerraformState.prototype, "projectId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => project_entity_1.Project, { nullable: false, onDelete: "CASCADE" }),
    (0, typeorm_1.JoinColumn)({ name: "project_id" }),
    __metadata("design:type", project_entity_1.Project)
], ProjectTerraformState.prototype, "project", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, name: "infrastructure_environment_id" }),
    __metadata("design:type", String)
], ProjectTerraformState.prototype, "infrastructureEnvironmentId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => project_infrastructure_environment_entity_1.ProjectInfrastructureEnvironment, { nullable: true, onDelete: "SET NULL" }),
    (0, typeorm_1.JoinColumn)({ name: "infrastructure_environment_id" }),
    __metadata("design:type", project_infrastructure_environment_entity_1.ProjectInfrastructureEnvironment)
], ProjectTerraformState.prototype, "infrastructureEnvironment", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: "dev", name: "environment_name" }),
    __metadata("design:type", String)
], ProjectTerraformState.prototype, "environmentName", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "state_bucket" }),
    __metadata("design:type", String)
], ProjectTerraformState.prototype, "stateBucket", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "state_key" }),
    __metadata("design:type", String)
], ProjectTerraformState.prototype, "stateKey", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "state_region" }),
    __metadata("design:type", String)
], ProjectTerraformState.prototype, "stateRegion", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, name: "current_version_id" }),
    __metadata("design:type", String)
], ProjectTerraformState.prototype, "currentVersionId", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, name: "previous_version_id" }),
    __metadata("design:type", String)
], ProjectTerraformState.prototype, "previousVersionId", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], ProjectTerraformState.prototype, "checksum", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, name: "resource_count" }),
    __metadata("design:type", Number)
], ProjectTerraformState.prototype, "resourceCount", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, name: "dependency_graph_hash" }),
    __metadata("design:type", String)
], ProjectTerraformState.prototype, "dependencyGraphHash", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: TerraformStateStatus.MISSING }),
    __metadata("design:type", String)
], ProjectTerraformState.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, name: "last_validated_at", type: "timestamp" }),
    __metadata("design:type", Date)
], ProjectTerraformState.prototype, "lastValidatedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, type: "jsonb" }),
    __metadata("design:type", Object)
], ProjectTerraformState.prototype, "metadata", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: "created_at" }),
    __metadata("design:type", Date)
], ProjectTerraformState.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: "updated_at" }),
    __metadata("design:type", Date)
], ProjectTerraformState.prototype, "updatedAt", void 0);
exports.ProjectTerraformState = ProjectTerraformState = __decorate([
    (0, typeorm_1.Entity)("project_terraform_states")
], ProjectTerraformState);
//# sourceMappingURL=project-terraform-state.entity.js.map