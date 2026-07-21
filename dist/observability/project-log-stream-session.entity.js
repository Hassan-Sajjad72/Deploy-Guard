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
exports.ProjectLogStreamSession = exports.LogStreamSessionSource = exports.LogStreamSessionStatus = void 0;
const typeorm_1 = require("typeorm");
const project_deployment_entity_1 = require("../orchestration/project-deployment.entity");
const project_pipeline_run_entity_1 = require("../projects/project-pipeline-run.entity");
const project_entity_1 = require("../projects/project.entity");
const user_entity_1 = require("../users/user.entity");
var LogStreamSessionStatus;
(function (LogStreamSessionStatus) {
    LogStreamSessionStatus["STARTED"] = "started";
    LogStreamSessionStatus["ACTIVE"] = "active";
    LogStreamSessionStatus["STOPPED"] = "stopped";
    LogStreamSessionStatus["FAILED"] = "failed";
})(LogStreamSessionStatus || (exports.LogStreamSessionStatus = LogStreamSessionStatus = {}));
var LogStreamSessionSource;
(function (LogStreamSessionSource) {
    LogStreamSessionSource["CLOUDWATCH_LOGS"] = "cloudwatch_logs";
    LogStreamSessionSource["MOCK"] = "mock";
})(LogStreamSessionSource || (exports.LogStreamSessionSource = LogStreamSessionSource = {}));
let ProjectLogStreamSession = class ProjectLogStreamSession {
};
exports.ProjectLogStreamSession = ProjectLogStreamSession;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)("uuid"),
    __metadata("design:type", String)
], ProjectLogStreamSession.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.Column)({ name: "project_id" }),
    __metadata("design:type", String)
], ProjectLogStreamSession.prototype, "projectId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => project_entity_1.Project, { nullable: false, onDelete: "CASCADE" }),
    (0, typeorm_1.JoinColumn)({ name: "project_id" }),
    __metadata("design:type", project_entity_1.Project)
], ProjectLogStreamSession.prototype, "project", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, name: "pipeline_run_id" }),
    __metadata("design:type", String)
], ProjectLogStreamSession.prototype, "pipelineRunId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => project_pipeline_run_entity_1.ProjectPipelineRun, { nullable: true, onDelete: "SET NULL" }),
    (0, typeorm_1.JoinColumn)({ name: "pipeline_run_id" }),
    __metadata("design:type", project_pipeline_run_entity_1.ProjectPipelineRun)
], ProjectLogStreamSession.prototype, "pipelineRun", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, name: "deployment_id" }),
    __metadata("design:type", String)
], ProjectLogStreamSession.prototype, "deploymentId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => project_deployment_entity_1.ProjectDeployment, { nullable: true, onDelete: "SET NULL" }),
    (0, typeorm_1.JoinColumn)({ name: "deployment_id" }),
    __metadata("design:type", project_deployment_entity_1.ProjectDeployment)
], ProjectLogStreamSession.prototype, "deployment", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, name: "user_id" }),
    __metadata("design:type", Number)
], ProjectLogStreamSession.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { nullable: true, onDelete: "SET NULL" }),
    (0, typeorm_1.JoinColumn)({ name: "user_id" }),
    __metadata("design:type", user_entity_1.User)
], ProjectLogStreamSession.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: LogStreamSessionStatus.STARTED }),
    __metadata("design:type", String)
], ProjectLogStreamSession.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: LogStreamSessionSource.CLOUDWATCH_LOGS }),
    __metadata("design:type", String)
], ProjectLogStreamSession.prototype, "source", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, name: "log_group_name" }),
    __metadata("design:type", String)
], ProjectLogStreamSession.prototype, "logGroupName", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, name: "log_stream_name" }),
    __metadata("design:type", String)
], ProjectLogStreamSession.prototype, "logStreamName", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "started_at", type: "timestamp" }),
    __metadata("design:type", Date)
], ProjectLogStreamSession.prototype, "startedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, name: "stopped_at", type: "timestamp" }),
    __metadata("design:type", Date)
], ProjectLogStreamSession.prototype, "stoppedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, name: "error_message", type: "text" }),
    __metadata("design:type", String)
], ProjectLogStreamSession.prototype, "errorMessage", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, type: "jsonb" }),
    __metadata("design:type", Object)
], ProjectLogStreamSession.prototype, "metadata", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: "created_at" }),
    __metadata("design:type", Date)
], ProjectLogStreamSession.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: "updated_at" }),
    __metadata("design:type", Date)
], ProjectLogStreamSession.prototype, "updatedAt", void 0);
exports.ProjectLogStreamSession = ProjectLogStreamSession = __decorate([
    (0, typeorm_1.Entity)("project_log_stream_sessions")
], ProjectLogStreamSession);
//# sourceMappingURL=project-log-stream-session.entity.js.map