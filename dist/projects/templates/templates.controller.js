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
exports.TemplatesController = void 0;
const common_1 = require("@nestjs/common");
const require_role_guard_1 = require("../../common/rbac/require-role.guard");
const user_entity_1 = require("../../users/user.entity");
const template_registry_service_1 = require("./template-registry.service");
let TemplatesController = class TemplatesController {
    constructor(templateRegistryService) {
        this.templateRegistryService = templateRegistryService;
    }
    listTemplates() {
        return { templates: this.templateRegistryService.listTemplates() };
    }
};
exports.TemplatesController = TemplatesController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], TemplatesController.prototype, "listTemplates", null);
exports.TemplatesController = TemplatesController = __decorate([
    (0, common_1.Controller)("api/templates"),
    (0, common_1.UseGuards)((0, require_role_guard_1.requireRole)([user_entity_1.UserRole.ADMIN, user_entity_1.UserRole.DEVELOPER, user_entity_1.UserRole.READONLY])),
    __metadata("design:paramtypes", [template_registry_service_1.TemplateRegistryService])
], TemplatesController);
//# sourceMappingURL=templates.controller.js.map