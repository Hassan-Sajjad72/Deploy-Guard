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
exports.ProjectObservabilityEvent = void 0;
const typeorm_1 = require("typeorm");
const project_deployment_entity_1 = require("../orchestration/project-deployment.entity");
const project_pipeline_run_entity_1 = require("../projects/project-pipeline-run.entity");
const project_entity_1 = require("../projects/project.entity");
const user_entity_1 = require("../users/user.entity");
let ProjectObservabilityEvent = class ProjectObservabilityEvent {
};
exports.ProjectObservabilityEvent = ProjectObservabilityEvent;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)("uuid"),
    __metadata("design:type", String)
], ProjectObservabilityEvent.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.Column)({ name: "project_id" }),
    __metadata("design:type", String)
], ProjectObservabilityEvent.prototype, "projectId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => project_entity_1.Project, { nullable: false, onDelete: "CASCADE" }),
    (0, typeorm_1.JoinColumn)({ name: "project_id" }),
    __metadata("design:type", project_entity_1.Project)
], ProjectObservabilityEvent.prototype, "project", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, name: "pipeline_run_id" }),
    __metadata("design:type", String)
], ProjectObservabilityEvent.prototype, "pipelineRunId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => project_pipeline_run_entity_1.ProjectPipelineRun, { nullable: true, onDelete: "SET NULL" }),
    (0, typeorm_1.JoinColumn)({ name: "pipeline_run_id" }),
    __metadata("design:type", project_pipeline_run_entity_1.ProjectPipelineRun)
], ProjectObservabilityEvent.prototype, "pipelineRun", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, name: "deployment_id" }),
    __metadata("design:type", String)
], ProjectObservabilityEvent.prototype, "deploymentId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => project_deployment_entity_1.ProjectDeployment, { nullable: true, onDelete: "SET NULL" }),
    (0, typeorm_1.JoinColumn)({ name: "deployment_id" }),
    __metadata("design:type", project_deployment_entity_1.ProjectDeployment)
], ProjectObservabilityEvent.prototype, "deployment", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "event_type" }),
    __metadata("design:type", String)
], ProjectObservabilityEvent.prototype, "eventType", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], ProjectObservabilityEvent.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text" }),
    __metadata("design:type", String)
], ProjectObservabilityEvent.prototype, "message", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, type: "jsonb" }),
    __metadata("design:type", Object)
], ProjectObservabilityEvent.prototype, "metadata", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, name: "actor_user_id" }),
    __metadata("design:type", Number)
], ProjectObservabilityEvent.prototype, "actorUserId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { nullable: true, onDelete: "SET NULL" }),
    (0, typeorm_1.JoinColumn)({ name: "actor_user_id" }),
    __metadata("design:type", user_entity_1.User)
], ProjectObservabilityEvent.prototype, "actorUser", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: "created_at" }),
    __metadata("design:type", Date)
], ProjectObservabilityEvent.prototype, "createdAt", void 0);
exports.ProjectObservabilityEvent = ProjectObservabilityEvent = __decorate([
    (0, typeorm_1.Entity)("project_observability_events")
], ProjectObservabilityEvent);
//# sourceMappingURL=project-observability-event.entity.js.map