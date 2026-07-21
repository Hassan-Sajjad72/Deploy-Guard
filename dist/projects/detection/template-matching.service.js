"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TemplateMatchingService = void 0;
const common_1 = require("@nestjs/common");
let TemplateMatchingService = class TemplateMatchingService {
    selectTemplate(draft) {
        if (draft.hasDockerfile) {
            return {
                selectedTemplate: "custom-dockerfile",
                dockerfileRequired: false,
                detectionStatus: "success",
            };
        }
        const frameworkTemplates = new Set([
            "nextjs-ssr",
            "nextjs-static",
            "express-server",
            "django-wsgi",
            "fastapi-asgi",
            "flask-wsgi",
            "rails-server",
        ]);
        if (draft.frameworkVariant && frameworkTemplates.has(draft.frameworkVariant)) {
            return {
                selectedTemplate: draft.frameworkVariant,
                dockerfileRequired: false,
                detectionStatus: "success",
            };
        }
        if (draft.ecosystem === "node") {
            return {
                selectedTemplate: "generic-node",
                dockerfileRequired: false,
                detectionStatus: "success",
            };
        }
        if (draft.ecosystem === "python") {
            return {
                selectedTemplate: "generic-python",
                dockerfileRequired: false,
                detectionStatus: "success",
            };
        }
        if (draft.ecosystem === "ruby") {
            return {
                selectedTemplate: "generic-ruby",
                dockerfileRequired: false,
                detectionStatus: "success",
            };
        }
        return {
            selectedTemplate: "custom-dockerfile-required",
            dockerfileRequired: true,
            detectionStatus: "needs_manual_dockerfile",
        };
    }
};
exports.TemplateMatchingService = TemplateMatchingService;
exports.TemplateMatchingService = TemplateMatchingService = __decorate([
    (0, common_1.Injectable)()
], TemplateMatchingService);
//# sourceMappingURL=template-matching.service.js.map