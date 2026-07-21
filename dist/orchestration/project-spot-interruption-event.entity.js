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
exports.ProjectSpotInterruptionEvent = exports.SpotInterruptionStatus = void 0;
const typeorm_1 = require("typeorm");
var SpotInterruptionStatus;
(function (SpotInterruptionStatus) {
    SpotInterruptionStatus["RECEIVED"] = "received";
    SpotInterruptionStatus["REPLACEMENT_TRIGGERED"] = "replacement_triggered";
    SpotInterruptionStatus["HANDLED"] = "handled";
    SpotInterruptionStatus["FAILED"] = "failed";
})(SpotInterruptionStatus || (exports.SpotInterruptionStatus = SpotInterruptionStatus = {}));
let ProjectSpotInterruptionEvent = class ProjectSpotInterruptionEvent {
};
exports.ProjectSpotInterruptionEvent = ProjectSpotInterruptionEvent;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)("uuid"),
    __metadata("design:type", String)
], ProjectSpotInterruptionEvent.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.Column)({ name: "project_id" }),
    __metadata("design:type", String)
], ProjectSpotInterruptionEvent.prototype, "projectId", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, name: "deployment_id" }),
    __metadata("design:type", String)
], ProjectSpotInterruptionEvent.prototype, "deploymentId", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, name: "pipeline_run_id" }),
    __metadata("design:type", String)
], ProjectSpotInterruptionEvent.prototype, "pipelineRunId", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, name: "ecs_cluster_arn" }),
    __metadata("design:type", String)
], ProjectSpotInterruptionEvent.prototype, "ecsClusterArn", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, name: "ecs_service_arn" }),
    __metadata("design:type", String)
], ProjectSpotInterruptionEvent.prototype, "ecsServiceArn", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, name: "task_arn" }),
    __metadata("design:type", String)
], ProjectSpotInterruptionEvent.prototype, "taskArn", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, name: "event_id" }),
    __metadata("design:type", String)
], ProjectSpotInterruptionEvent.prototype, "eventId", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, name: "event_time", type: "timestamp" }),
    __metadata("design:type", Date)
], ProjectSpotInterruptionEvent.prototype, "eventTime", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], ProjectSpotInterruptionEvent.prototype, "reason", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: SpotInterruptionStatus.RECEIVED }),
    __metadata("design:type", String)
], ProjectSpotInterruptionEvent.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, type: "jsonb" }),
    __metadata("design:type", Object)
], ProjectSpotInterruptionEvent.prototype, "metadata", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: "created_at" }),
    __metadata("design:type", Date)
], ProjectSpotInterruptionEvent.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: "updated_at" }),
    __metadata("design:type", Date)
], ProjectSpotInterruptionEvent.prototype, "updatedAt", void 0);
exports.ProjectSpotInterruptionEvent = ProjectSpotInterruptionEvent = __decorate([
    (0, typeorm_1.Entity)("project_spot_interruption_events")
], ProjectSpotInterruptionEvent);
//# sourceMappingURL=project-spot-interruption-event.entity.js.map