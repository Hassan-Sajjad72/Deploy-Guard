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
exports.ProjectDeploymentQueueItem = exports.DeploymentQueueStatus = void 0;
const typeorm_1 = require("typeorm");
var DeploymentQueueStatus;
(function (DeploymentQueueStatus) {
    DeploymentQueueStatus["QUEUED"] = "queued";
    DeploymentQueueStatus["WAITING_FOR_LOCK"] = "waiting_for_lock";
    DeploymentQueueStatus["PROCESSING"] = "processing";
    DeploymentQueueStatus["COMPLETED"] = "completed";
    DeploymentQueueStatus["FAILED"] = "failed";
    DeploymentQueueStatus["CANCELLED"] = "cancelled";
})(DeploymentQueueStatus || (exports.DeploymentQueueStatus = DeploymentQueueStatus = {}));
let ProjectDeploymentQueueItem = class ProjectDeploymentQueueItem {
};
exports.ProjectDeploymentQueueItem = ProjectDeploymentQueueItem;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)("uuid"),
    __metadata("design:type", String)
], ProjectDeploymentQueueItem.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.Column)({ name: "project_id" }),
    __metadata("design:type", String)
], ProjectDeploymentQueueItem.prototype, "projectId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "pipeline_run_id" }),
    __metadata("design:type", String)
], ProjectDeploymentQueueItem.prototype, "pipelineRunId", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: "dev", name: "environment_name" }),
    __metadata("design:type", String)
], ProjectDeploymentQueueItem.prototype, "environmentName", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: DeploymentQueueStatus.QUEUED }),
    __metadata("design:type", String)
], ProjectDeploymentQueueItem.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], ProjectDeploymentQueueItem.prototype, "position", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, type: "text" }),
    __metadata("design:type", String)
], ProjectDeploymentQueueItem.prototype, "reason", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, name: "started_at", type: "timestamp" }),
    __metadata("design:type", Date)
], ProjectDeploymentQueueItem.prototype, "startedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, name: "completed_at", type: "timestamp" }),
    __metadata("design:type", Date)
], ProjectDeploymentQueueItem.prototype, "completedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, name: "failed_at", type: "timestamp" }),
    __metadata("design:type", Date)
], ProjectDeploymentQueueItem.prototype, "failedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, type: "jsonb" }),
    __metadata("design:type", Object)
], ProjectDeploymentQueueItem.prototype, "metadata", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: "created_at" }),
    __metadata("design:type", Date)
], ProjectDeploymentQueueItem.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: "updated_at" }),
    __metadata("design:type", Date)
], ProjectDeploymentQueueItem.prototype, "updatedAt", void 0);
exports.ProjectDeploymentQueueItem = ProjectDeploymentQueueItem = __decorate([
    (0, typeorm_1.Entity)("project_deployment_queue_items")
], ProjectDeploymentQueueItem);
//# sourceMappingURL=project-deployment-queue-item.entity.js.map