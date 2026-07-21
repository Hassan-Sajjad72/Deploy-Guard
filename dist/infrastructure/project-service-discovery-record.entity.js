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
exports.ProjectServiceDiscoveryRecord = void 0;
const typeorm_1 = require("typeorm");
const project_entity_1 = require("../projects/project.entity");
const project_infrastructure_environment_entity_1 = require("./project-infrastructure-environment.entity");
let ProjectServiceDiscoveryRecord = class ProjectServiceDiscoveryRecord {
};
exports.ProjectServiceDiscoveryRecord = ProjectServiceDiscoveryRecord;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)("uuid"),
    __metadata("design:type", String)
], ProjectServiceDiscoveryRecord.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.Column)({ name: "project_id" }),
    __metadata("design:type", String)
], ProjectServiceDiscoveryRecord.prototype, "projectId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => project_entity_1.Project, { nullable: false, onDelete: "CASCADE" }),
    (0, typeorm_1.JoinColumn)({ name: "project_id" }),
    __metadata("design:type", project_entity_1.Project)
], ProjectServiceDiscoveryRecord.prototype, "project", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "infrastructure_environment_id" }),
    __metadata("design:type", String)
], ProjectServiceDiscoveryRecord.prototype, "infrastructureEnvironmentId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => project_infrastructure_environment_entity_1.ProjectInfrastructureEnvironment, { nullable: false, onDelete: "CASCADE" }),
    (0, typeorm_1.JoinColumn)({ name: "infrastructure_environment_id" }),
    __metadata("design:type", project_infrastructure_environment_entity_1.ProjectInfrastructureEnvironment)
], ProjectServiceDiscoveryRecord.prototype, "infrastructureEnvironment", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "service_name" }),
    __metadata("design:type", String)
], ProjectServiceDiscoveryRecord.prototype, "serviceName", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "namespace_id" }),
    __metadata("design:type", String)
], ProjectServiceDiscoveryRecord.prototype, "namespaceId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "namespace_name" }),
    __metadata("design:type", String)
], ProjectServiceDiscoveryRecord.prototype, "namespaceName", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "dns_name" }),
    __metadata("design:type", String)
], ProjectServiceDiscoveryRecord.prototype, "dnsName", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, name: "cloud_map_service_id" }),
    __metadata("design:type", String)
], ProjectServiceDiscoveryRecord.prototype, "cloudMapServiceId", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: "ready" }),
    __metadata("design:type", String)
], ProjectServiceDiscoveryRecord.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, type: "jsonb" }),
    __metadata("design:type", Object)
], ProjectServiceDiscoveryRecord.prototype, "metadata", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: "created_at" }),
    __metadata("design:type", Date)
], ProjectServiceDiscoveryRecord.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: "updated_at" }),
    __metadata("design:type", Date)
], ProjectServiceDiscoveryRecord.prototype, "updatedAt", void 0);
exports.ProjectServiceDiscoveryRecord = ProjectServiceDiscoveryRecord = __decorate([
    (0, typeorm_1.Entity)("project_service_discovery_records")
], ProjectServiceDiscoveryRecord);
//# sourceMappingURL=project-service-discovery-record.entity.js.map