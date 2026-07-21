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
exports.ProjectRollbackRecord = exports.RollbackStatus = void 0;
const typeorm_1 = require("typeorm");
var RollbackStatus;
(function (RollbackStatus) {
    RollbackStatus["STARTED"] = "started";
    RollbackStatus["SUCCEEDED"] = "succeeded";
    RollbackStatus["FAILED"] = "failed";
})(RollbackStatus || (exports.RollbackStatus = RollbackStatus = {}));
let ProjectRollbackRecord = class ProjectRollbackRecord {
};
exports.ProjectRollbackRecord = ProjectRollbackRecord;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)("uuid"),
    __metadata("design:type", String)
], ProjectRollbackRecord.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.Column)({ name: "project_id" }),
    __metadata("design:type", String)
], ProjectRollbackRecord.prototype, "projectId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "deployment_id" }),
    __metadata("design:type", String)
], ProjectRollbackRecord.prototype, "deploymentId", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, name: "pipeline_run_id" }),
    __metadata("design:type", String)
], ProjectRollbackRecord.prototype, "pipelineRunId", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, name: "from_commit_sha" }),
    __metadata("design:type", String)
], ProjectRollbackRecord.prototype, "fromCommitSha", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "to_commit_sha" }),
    __metadata("design:type", String)
], ProjectRollbackRecord.prototype, "toCommitSha", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, name: "from_task_definition_arn" }),
    __metadata("design:type", String)
], ProjectRollbackRecord.prototype, "fromTaskDefinitionArn", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, name: "to_task_definition_arn" }),
    __metadata("design:type", String)
], ProjectRollbackRecord.prototype, "toTaskDefinitionArn", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text" }),
    __metadata("design:type", String)
], ProjectRollbackRecord.prototype, "reason", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: RollbackStatus.STARTED }),
    __metadata("design:type", String)
], ProjectRollbackRecord.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "started_at", type: "timestamp" }),
    __metadata("design:type", Date)
], ProjectRollbackRecord.prototype, "startedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, name: "completed_at", type: "timestamp" }),
    __metadata("design:type", Date)
], ProjectRollbackRecord.prototype, "completedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, type: "jsonb" }),
    __metadata("design:type", Object)
], ProjectRollbackRecord.prototype, "metadata", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, name: "error_message", type: "text" }),
    __metadata("design:type", String)
], ProjectRollbackRecord.prototype, "errorMessage", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: "created_at" }),
    __metadata("design:type", Date)
], ProjectRollbackRecord.prototype, "createdAt", void 0);
exports.ProjectRollbackRecord = ProjectRollbackRecord = __decorate([
    (0, typeorm_1.Entity)("project_rollback_records")
], ProjectRollbackRecord);
//# sourceMappingURL=project-rollback-record.entity.js.map