"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DockerTemplateEngineService = void 0;
const common_1 = require("@nestjs/common");
const fs_1 = require("fs");
const path_1 = require("path");
let DockerTemplateEngineService = class DockerTemplateEngineService {
    renderDockerfile(template, profile) {
        if (!template.dockerfileTemplatePath) {
            return null;
        }
        const templatePath = (0, path_1.join)(process.cwd(), template.dockerfileTemplatePath);
        const content = (0, fs_1.readFileSync)(templatePath, "utf8");
        const startCommand = profile.startCommand || this.defaultStartCommand(template);
        const buildCommand = profile.buildCommand || this.defaultBuildCommand(template);
        const values = {
            PACKAGE_MANAGER: profile.packageManager || "npm",
            INSTALL_COMMAND: this.installCommand(profile),
            BUILD_COMMAND: buildCommand,
            START_COMMAND: startCommand,
            START_COMMAND_JSON: JSON.stringify(["sh", "-c", startCommand]),
            EXPECTED_PORT: String(profile.expectedPort || template.defaultPort || 3000),
            RUNTIME_VERSION: profile.runtimeVersion || "",
            APP_ENTRY: this.appEntry(profile),
            STATIC_OUTPUT: profile.staticOutput ? "true" : "false",
            HEALTH_CHECK_PATH: profile.healthCheckPath || "/",
        };
        return content.replace(/\{\{([A-Z_]+)\}\}/g, (_match, key) => values[key] ?? "");
    }
    installCommand(profile) {
        if (profile.ecosystem === "python") {
            return profile.packageManager === "poetry"
                ? "pip install --no-cache-dir poetry && poetry install --only main --no-root"
                : "pip install --no-cache-dir -r requirements.txt";
        }
        if (profile.packageManager === "pnpm") {
            return "corepack enable && pnpm install --frozen-lockfile";
        }
        if (profile.packageManager === "yarn") {
            return "yarn install --frozen-lockfile";
        }
        return "npm ci || npm install";
    }
    defaultBuildCommand(template) {
        return template.ecosystem === "node" ? "npm run build" : "true";
    }
    defaultStartCommand(template) {
        if (template.templateKey === "django-wsgi") {
            return "gunicorn app.wsgi:application --bind 0.0.0.0:8000";
        }
        if (template.templateKey === "fastapi-asgi") {
            return "uvicorn main:app --host 0.0.0.0 --port 8000";
        }
        if (template.templateKey === "flask-wsgi") {
            return "gunicorn app:app --bind 0.0.0.0:5000";
        }
        return "npm start";
    }
    appEntry(profile) {
        return profile.frameworkVariant || "app";
    }
};
exports.DockerTemplateEngineService = DockerTemplateEngineService;
exports.DockerTemplateEngineService = DockerTemplateEngineService = __decorate([
    (0, common_1.Injectable)()
], DockerTemplateEngineService);
//# sourceMappingURL=docker-template-engine.service.js.map