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
exports.ProjectStateValidationResult = exports.StateValidationStatus = void 0;
const typeorm_1 = require("typeorm");
var StateValidationStatus;
(function (StateValidationStatus) {
    StateValidationStatus["VALID"] = "valid";
    StateValidationStatus["CORRUPTED"] = "corrupted";
    StateValidationStatus["WARNING"] = "warning";
    StateValidationStatus["FAILED"] = "failed";
})(StateValidationStatus || (exports.StateValidationStatus = StateValidationStatus = {}));
let ProjectStateValidationResult = class ProjectStateValidationResult {
};
exports.ProjectStateValidationResult = ProjectStateValidationResult;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)("uuid"),
    __metadata("design:type", String)
], ProjectStateValidationResult.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.Column)({ name: "project_id" }),
    __metadata("design:type", String)
], ProjectStateValidationResult.prototype, "projectId", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, name: "infrastructure_environment_id" }),
    __metadata("design:type", String)
], ProjectStateValidationResult.prototype, "infrastructureEnvironmentId", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: "dev", name: "environment_name" }),
    __metadata("design:type", String)
], ProjectStateValidationResult.prototype, "environmentName", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, name: "state_version_id" }),
    __metadata("design:type", String)
], ProjectStateValidationResult.prototype, "stateVersionId", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], ProjectStateValidationResult.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "json_schema_valid" }),
    __metadata("design:type", Boolean)
], ProjectStateValidationResult.prototype, "jsonSchemaValid", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "checksum_valid" }),
    __metadata("design:type", Boolean)
], ProjectStateValidationResult.prototype, "checksumValid", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "resource_count_valid" }),
    __metadata("design:type", Boolean)
], ProjectStateValidationResult.prototype, "resourceCountValid", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "dependency_graph_valid" }),
    __metadata("design:type", Boolean)
], ProjectStateValidationResult.prototype, "dependencyGraphValid", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, name: "resource_count" }),
    __metadata("design:type", Number)
], ProjectStateValidationResult.prototype, "resourceCount", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, name: "expected_checksum" }),
    __metadata("design:type", String)
], ProjectStateValidationResult.prototype, "expectedChecksum", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, name: "actual_checksum" }),
    __metadata("design:type", String)
], ProjectStateValidationResult.prototype, "actualChecksum", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, type: "jsonb" }),
    __metadata("design:type", Array)
], ProjectStateValidationResult.prototype, "issues", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: "created_at" }),
    __metadata("design:type", Date)
], ProjectStateValidationResult.prototype, "createdAt", void 0);
exports.ProjectStateValidationResult = ProjectStateValidationResult = __decorate([
    (0, typeorm_1.Entity)("project_state_validation_results")
], ProjectStateValidationResult);
//# sourceMappingURL=project-state-validation-result.entity.js.map