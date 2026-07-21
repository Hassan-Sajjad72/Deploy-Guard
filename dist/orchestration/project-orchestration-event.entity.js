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
exports.ProjectOrchestrationEvent = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("../users/user.entity");
const project_deployment_entity_1 = require("./project-deployment.entity");
let ProjectOrchestrationEvent = class ProjectOrchestrationEvent {
};
exports.ProjectOrchestrationEvent = ProjectOrchestrationEvent;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)("uuid"),
    __metadata("design:type", String)
], ProjectOrchestrationEvent.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.Column)({ name: "project_id" }),
    __metadata("design:type", String)
], ProjectOrchestrationEvent.prototype, "projectId", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, name: "pipeline_run_id" }),
    __metadata("design:type", String)
], ProjectOrchestrationEvent.prototype, "pipelineRunId", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, name: "deployment_id" }),
    __metadata("design:type", String)
], ProjectOrchestrationEvent.prototype, "deploymentId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => project_deployment_entity_1.ProjectDeployment, { nullable: true, onDelete: "SET NULL" }),
    (0, typeorm_1.JoinColumn)({ name: "deployment_id" }),
    __metadata("design:type", project_deployment_entity_1.ProjectDeployment)
], ProjectOrchestrationEvent.prototype, "deployment", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "event_type" }),
    __metadata("design:type", String)
], ProjectOrchestrationEvent.prototype, "eventType", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], ProjectOrchestrationEvent.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text" }),
    __metadata("design:type", String)
], ProjectOrchestrationEvent.prototype, "message", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, type: "jsonb" }),
    __metadata("design:type", Object)
], ProjectOrchestrationEvent.prototype, "metadata", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, name: "actor_user_id" }),
    __metadata("design:type", Number)
], ProjectOrchestrationEvent.prototype, "actorUserId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { nullable: true, onDelete: "SET NULL" }),
    (0, typeorm_1.JoinColumn)({ name: "actor_user_id" }),
    __metadata("design:type", user_entity_1.User)
], ProjectOrchestrationEvent.prototype, "actorUser", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: "created_at" }),
    __metadata("design:type", Date)
], ProjectOrchestrationEvent.prototype, "createdAt", void 0);
exports.ProjectOrchestrationEvent = ProjectOrchestrationEvent = __decorate([
    (0, typeorm_1.Entity)("project_orchestration_events")
], ProjectOrchestrationEvent);
//# sourceMappingURL=project-orchestration-event.entity.js.map