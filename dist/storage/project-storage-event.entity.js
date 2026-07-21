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
exports.ProjectStorageEvent = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("../users/user.entity");
const project_persistent_storage_entity_1 = require("./project-persistent-storage.entity");
let ProjectStorageEvent = class ProjectStorageEvent {
};
exports.ProjectStorageEvent = ProjectStorageEvent;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)("uuid"),
    __metadata("design:type", String)
], ProjectStorageEvent.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.Column)({ name: "project_id" }),
    __metadata("design:type", String)
], ProjectStorageEvent.prototype, "projectId", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, name: "pipeline_run_id" }),
    __metadata("design:type", String)
], ProjectStorageEvent.prototype, "pipelineRunId", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, name: "persistent_storage_id" }),
    __metadata("design:type", String)
], ProjectStorageEvent.prototype, "persistentStorageId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => project_persistent_storage_entity_1.ProjectPersistentStorage, { nullable: true, onDelete: "SET NULL" }),
    (0, typeorm_1.JoinColumn)({ name: "persistent_storage_id" }),
    __metadata("design:type", project_persistent_storage_entity_1.ProjectPersistentStorage)
], ProjectStorageEvent.prototype, "persistentStorage", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "event_type" }),
    __metadata("design:type", String)
], ProjectStorageEvent.prototype, "eventType", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], ProjectStorageEvent.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text" }),
    __metadata("design:type", String)
], ProjectStorageEvent.prototype, "message", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, type: "jsonb" }),
    __metadata("design:type", Object)
], ProjectStorageEvent.prototype, "metadata", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, name: "actor_user_id" }),
    __metadata("design:type", Number)
], ProjectStorageEvent.prototype, "actorUserId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { nullable: true, onDelete: "SET NULL" }),
    (0, typeorm_1.JoinColumn)({ name: "actor_user_id" }),
    __metadata("design:type", user_entity_1.User)
], ProjectStorageEvent.prototype, "actorUser", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: "created_at" }),
    __metadata("design:type", Date)
], ProjectStorageEvent.prototype, "createdAt", void 0);
exports.ProjectStorageEvent = ProjectStorageEvent = __decorate([
    (0, typeorm_1.Entity)("project_storage_events")
], ProjectStorageEvent);
//# sourceMappingURL=project-storage-event.entity.js.map