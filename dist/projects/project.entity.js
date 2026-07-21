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
exports.Project = exports.ProjectVisibility = exports.ProjectStatus = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("../users/user.entity");
const project_environment_variable_entity_1 = require("./project-environment-variable.entity");
var ProjectStatus;
(function (ProjectStatus) {
    ProjectStatus["CREATED"] = "created";
    ProjectStatus["CONFIGURED"] = "configured";
    ProjectStatus["ARCHIVED"] = "archived";
})(ProjectStatus || (exports.ProjectStatus = ProjectStatus = {}));
var ProjectVisibility;
(function (ProjectVisibility) {
    ProjectVisibility["PRIVATE"] = "private";
    ProjectVisibility["WORKSPACE"] = "workspace";
})(ProjectVisibility || (exports.ProjectVisibility = ProjectVisibility = {}));
let Project = class Project {
};
exports.Project = Project;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)("uuid"),
    __metadata("design:type", String)
], Project.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.Column)({ name: "owner_user_id" }),
    __metadata("design:type", Number)
], Project.prototype, "ownerUserId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { nullable: false, onDelete: "CASCADE" }),
    (0, typeorm_1.JoinColumn)({ name: "owner_user_id" }),
    __metadata("design:type", user_entity_1.User)
], Project.prototype, "owner", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Project.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Project.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "repository_url" }),
    __metadata("design:type", String)
], Project.prototype, "repositoryUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: "github", name: "repository_provider" }),
    __metadata("design:type", String)
], Project.prototype, "repositoryProvider", void 0);
__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.Column)({ nullable: true, name: "repository_full_name" }),
    __metadata("design:type", String)
], Project.prototype, "repositoryFullName", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: "main", name: "target_branch" }),
    __metadata("design:type", String)
], Project.prototype, "targetBranch", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "enum",
        enum: ProjectStatus,
        default: ProjectStatus.CREATED,
    }),
    __metadata("design:type", String)
], Project.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "enum",
        enum: ProjectVisibility,
        default: ProjectVisibility.PRIVATE,
    }),
    __metadata("design:type", String)
], Project.prototype, "visibility", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => project_environment_variable_entity_1.ProjectEnvironmentVariable, (variable) => variable.project),
    __metadata("design:type", Array)
], Project.prototype, "environmentVariables", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: "created_at" }),
    __metadata("design:type", Date)
], Project.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: "updated_at" }),
    __metadata("design:type", Date)
], Project.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, name: "archived_at", type: "timestamp" }),
    __metadata("design:type", Date)
], Project.prototype, "archivedAt", void 0);
exports.Project = Project = __decorate([
    (0, typeorm_1.Entity)("projects")
], Project);
//# sourceMappingURL=project.entity.js.map