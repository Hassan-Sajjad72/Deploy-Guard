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
exports.ProjectInfrastructureEvent = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("../users/user.entity");
const project_infrastructure_environment_entity_1 = require("./project-infrastructure-environment.entity");
const project_pipeline_run_entity_1 = require("../projects/project-pipeline-run.entity");
const project_entity_1 = require("../projects/project.entity");
let ProjectInfrastructureEvent = class ProjectInfrastructureEvent {
};
exports.ProjectInfrastructureEvent = ProjectInfrastructureEvent;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)("uuid"),
    __metadata("design:type", String)
], ProjectInfrastructureEvent.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.Column)({ name: "project_id" }),
    __metadata("design:type", String)
], ProjectInfrastructureEvent.prototype, "projectId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => project_entity_1.Project, { nullable: false, onDelete: "CASCADE" }),
    (0, typeorm_1.JoinColumn)({ name: "project_id" }),
    __metadata("design:type", project_entity_1.Project)
], ProjectInfrastructureEvent.prototype, "project", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, name: "pipeline_run_id" }),
    __metadata("design:type", String)
], ProjectInfrastructureEvent.prototype, "pipelineRunId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => project_pipeline_run_entity_1.ProjectPipelineRun, { nullable: true, onDelete: "SET NULL" }),
    (0, typeorm_1.JoinColumn)({ name: "pipeline_run_id" }),
    __metadata("design:type", project_pipeline_run_entity_1.ProjectPipelineRun)
], ProjectInfrastructureEvent.prototype, "pipelineRun", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, name: "infrastructure_environment_id" }),
    __metadata("design:type", String)
], ProjectInfrastructureEvent.prototype, "infrastructureEnvironmentId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => project_infrastructure_environment_entity_1.ProjectInfrastructureEnvironment, { nullable: true, onDelete: "SET NULL" }),
    (0, typeorm_1.JoinColumn)({ name: "infrastructure_environment_id" }),
    __metadata("design:type", project_infrastructure_environment_entity_1.ProjectInfrastructureEnvironment)
], ProjectInfrastructureEvent.prototype, "infrastructureEnvironment", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "event_type" }),
    __metadata("design:type", String)
], ProjectInfrastructureEvent.prototype, "eventType", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], ProjectInfrastructureEvent.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text" }),
    __metadata("design:type", String)
], ProjectInfrastructureEvent.prototype, "message", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, type: "jsonb" }),
    __metadata("design:type", Object)
], ProjectInfrastructureEvent.prototype, "metadata", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, name: "actor_user_id" }),
    __metadata("design:type", Number)
], ProjectInfrastructureEvent.prototype, "actorUserId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { nullable: true, onDelete: "SET NULL" }),
    (0, typeorm_1.JoinColumn)({ name: "actor_user_id" }),
    __metadata("design:type", user_entity_1.User)
], ProjectInfrastructureEvent.prototype, "actorUser", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: "created_at" }),
    __metadata("design:type", Date)
], ProjectInfrastructureEvent.prototype, "createdAt", void 0);
exports.ProjectInfrastructureEvent = ProjectInfrastructureEvent = __decorate([
    (0, typeorm_1.Entity)("project_infrastructure_events")
], ProjectInfrastructureEvent);
//# sourceMappingURL=project-infrastructure-event.entity.js.map