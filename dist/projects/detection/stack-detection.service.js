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
exports.StackDetectionService = void 0;
const common_1 = require("@nestjs/common");
const fs_1 = require("fs");
const path_1 = require("path");
const template_matching_service_1 = require("./template-matching.service");
let StackDetectionService = class StackDetectionService {
    constructor(templateMatchingService) {
        this.templateMatchingService = templateMatchingService;
    }
    detect(workspacePath, commitSha) {
        const rootFiles = new Set((0, fs_1.readdirSync)(workspacePath));
        const hasDockerfile = rootFiles.has("Dockerfile");
        const warnings = [];
        const errors = [];
        const rawProfile = { rootFiles: Array.from(rootFiles).sort() };
        let profile = this.baseProfile(commitSha, hasDockerfile, warnings, errors, rawProfile);
        if (rootFiles.has("package.json")) {
            profile = this.detectNode(workspacePath, rootFiles, profile);
        }
        else if (rootFiles.has("requirements.txt") ||
            rootFiles.has("pyproject.toml") ||
            rootFiles.has("Pipfile") ||
            rootFiles.has("setup.py")) {
            profile = this.detectPython(workspacePath, rootFiles, profile);
        }
        else if (rootFiles.has("Gemfile")) {
            profile = this.detectRuby(workspacePath, profile);
        }
        else {
            warnings.push("No supported root-level ecosystem manifest found.");
        }
        const template = this.templateMatchingService.selectTemplate(profile);
        profile.selectedTemplate = template.selectedTemplate;
        profile.dockerfileRequired = template.dockerfileRequired;
        profile.detectionStatus = template.detectionStatus;
        if (profile.selectedTemplate === "custom-dockerfile-required") {
            warnings.push("No safe automatic template was found.");
            profile.confidence = "low";
        }
        else if (profile.framework && profile.framework !== "unknown") {
            profile.confidence = "high";
        }
        else if (profile.ecosystem !== "unknown") {
            profile.confidence = "medium";
        }
        return profile;
    }
    detectNode(workspacePath, rootFiles, profile) {
        const packageJson = this.readJson((0, path_1.join)(workspacePath, "package.json"), profile);
        const dependencies = {
            ...(packageJson?.dependencies || {}),
            ...(packageJson?.devDependencies || {}),
        };
        const scripts = packageJson?.scripts || {};
        const hasNextConfig = rootFiles.has("next.config.js") || rootFiles.has("next.config.mjs");
        const hasNext = Boolean(dependencies.next);
        const hasExpress = Boolean(dependencies.express);
        const db = this.detectNodeDatabase(dependencies);
        profile.ecosystem = "node";
        profile.language = "javascript";
        profile.packageManager = rootFiles.has("pnpm-lock.yaml")
            ? "pnpm"
            : rootFiles.has("yarn.lock")
                ? "yarn"
                : "npm";
        profile.runtimeVersion = packageJson?.engines?.node || "node-lts";
        profile.buildCommand = scripts.build ? `${profile.packageManager} run build` : null;
        profile.expectedPort = this.extractPortFromScripts(scripts) || 3000;
        profile.healthCheckPath = this.hasExpressHealthRoute(workspacePath) ? "/health" : "/";
        profile.requiresDatabase = Boolean(db);
        profile.databaseType = db;
        this.detectPersistentStorage(workspacePath, rootFiles, profile, dependencies);
        if (hasNext && hasNextConfig) {
            const nextConfigText = this.readOptionalText(workspacePath, [
                "next.config.js",
                "next.config.mjs",
            ]);
            const isStaticExport = /output\s*:\s*["']export["']/.test(nextConfigText || "") ||
                Object.values(scripts).some((script) => String(script).includes("next export"));
            profile.framework = "nextjs";
            profile.frameworkVariant = isStaticExport ? "nextjs-static" : "nextjs-ssr";
            profile.staticOutput = isStaticExport;
            profile.startCommand = scripts.start
                ? `${profile.packageManager} start`
                : isStaticExport
                    ? null
                    : "next start";
            return profile;
        }
        if (hasExpress) {
            profile.framework = "express";
            profile.frameworkVariant = "express-server";
            profile.startCommand = scripts.start
                ? `${profile.packageManager} start`
                : rootFiles.has("server.js")
                    ? "node server.js"
                    : "npm start";
            return profile;
        }
        profile.framework = "unknown";
        profile.frameworkVariant = "generic-node";
        profile.startCommand = scripts.start ? `${profile.packageManager} start` : null;
        return profile;
    }
    detectPython(workspacePath, rootFiles, profile) {
        const dependencyText = [
            this.readOptionalFile(workspacePath, "requirements.txt"),
            this.readOptionalFile(workspacePath, "pyproject.toml"),
            this.readOptionalFile(workspacePath, "Pipfile"),
            this.readOptionalFile(workspacePath, "setup.py"),
        ]
            .filter(Boolean)
            .join("\n")
            .toLowerCase();
        profile.ecosystem = "python";
        profile.language = "python";
        profile.packageManager = rootFiles.has("pyproject.toml") &&
            /poetry/.test(this.readOptionalFile(workspacePath, "pyproject.toml") || "")
            ? "poetry"
            : "pip";
        profile.runtimeVersion =
            this.readOptionalFile(workspacePath, "runtime.txt")?.trim() ||
                this.readOptionalFile(workspacePath, ".python-version")?.trim() ||
                "python-3.11";
        profile.healthCheckPath = "/";
        this.detectPythonPersistentStorage(workspacePath, rootFiles, profile, dependencyText);
        if (dependencyText.includes("django") || rootFiles.has("manage.py")) {
            profile.framework = "django";
            profile.frameworkVariant = "django-wsgi";
            profile.expectedPort = 8000;
            profile.startCommand = `gunicorn ${this.detectDjangoProjectName(workspacePath)}.wsgi:application`;
            const settingsText = this.readDjangoSettings(workspacePath);
            profile.requiresDatabase =
                /DATABASES/.test(settingsText) &&
                    /(postgres|postgresql|psycopg2|dj_database_url)/i.test(settingsText);
            profile.databaseType = profile.requiresDatabase ? "postgres" : null;
            if (/MEDIA_ROOT/i.test(settingsText)) {
                profile.requiresPersistentStorage = true;
                profile.rawProfile.persistentStorageReason = "Django MEDIA_ROOT configured.";
            }
            return profile;
        }
        if (dependencyText.includes("fastapi")) {
            profile.framework = "fastapi";
            profile.frameworkVariant = "fastapi-asgi";
            profile.expectedPort = 8000;
            profile.startCommand = (0, fs_1.existsSync)((0, path_1.join)(workspacePath, "app", "main.py"))
                ? "uvicorn app.main:app --host 0.0.0.0 --port 8000"
                : "uvicorn main:app --host 0.0.0.0 --port 8000";
            profile.requiresDatabase = /(sqlalchemy|asyncpg|psycopg2|databases|tortoise-orm)/.test(dependencyText);
            profile.databaseType = profile.requiresDatabase ? "postgres" : null;
            return profile;
        }
        if (dependencyText.includes("flask")) {
            profile.framework = "flask";
            profile.frameworkVariant = "flask-wsgi";
            profile.expectedPort = 5000;
            profile.startCommand = rootFiles.has("wsgi.py")
                ? "gunicorn wsgi:app"
                : "gunicorn app:app";
            const flaskText = [
                this.readOptionalFile(workspacePath, "app.py"),
                this.readOptionalFile(workspacePath, "wsgi.py"),
            ].join("\n");
            if (/UPLOAD_FOLDER/i.test(flaskText)) {
                profile.requiresPersistentStorage = true;
                profile.rawProfile.persistentStorageReason = "Flask upload folder configured.";
            }
            return profile;
        }
        profile.framework = "unknown";
        profile.frameworkVariant = "generic-python";
        profile.expectedPort = 8000;
        return profile;
    }
    detectRuby(workspacePath, profile) {
        const gemfile = this.readOptionalFile(workspacePath, "Gemfile")?.toLowerCase() || "";
        profile.ecosystem = "ruby";
        profile.language = "ruby";
        profile.packageManager = "bundler";
        if (gemfile.includes("rails")) {
            profile.framework = "rails";
            profile.frameworkVariant = "rails-server";
            profile.expectedPort = 3000;
            profile.startCommand = "bundle exec rails server -b 0.0.0.0";
            profile.requiresDatabase = true;
            profile.databaseType = "postgres";
            return profile;
        }
        profile.framework = "unknown";
        profile.frameworkVariant = "generic-ruby";
        return profile;
    }
    baseProfile(commitSha, hasDockerfile, warnings, errors, rawProfile) {
        return {
            commitSha,
            ecosystem: "unknown",
            language: null,
            framework: "unknown",
            frameworkVariant: null,
            packageManager: null,
            runtimeVersion: null,
            buildCommand: null,
            startCommand: null,
            expectedPort: null,
            healthCheckPath: "/",
            requiresDatabase: false,
            databaseType: null,
            requiresPersistentStorage: false,
            staticOutput: false,
            dockerfileRequired: false,
            hasDockerfile,
            selectedTemplate: null,
            confidence: "low",
            detectionStatus: "failed",
            warnings,
            errors,
            rawProfile,
        };
    }
    readJson(path, profile) {
        try {
            return JSON.parse((0, fs_1.readFileSync)(path, "utf8"));
        }
        catch {
            profile.errors.push("package.json could not be parsed.");
            return null;
        }
    }
    readOptionalText(workspacePath, names) {
        const name = names.find((candidate) => (0, fs_1.existsSync)((0, path_1.join)(workspacePath, candidate)));
        return name ? this.readOptionalFile(workspacePath, name) : null;
    }
    readOptionalFile(workspacePath, name) {
        const path = (0, path_1.join)(workspacePath, name);
        return (0, fs_1.existsSync)(path) ? (0, fs_1.readFileSync)(path, "utf8") : null;
    }
    extractPortFromScripts(scripts) {
        const joinedScripts = Object.values(scripts).map(String).join(" ");
        const match = joinedScripts.match(/PORT=(\d+)/) ||
            joinedScripts.match(/--port\s+(\d+)/) ||
            joinedScripts.match(/-p\s+(\d+)/);
        return match ? Number(match[1]) : null;
    }
    hasExpressHealthRoute(workspacePath) {
        return ["server.js", "app.js", "index.js"].some((file) => {
            const text = this.readOptionalFile(workspacePath, file);
            return text ? /["']\/health["']/.test(text) : false;
        });
    }
    detectDjangoProjectName(workspacePath) {
        if (!(0, fs_1.existsSync)((0, path_1.join)(workspacePath, "manage.py"))) {
            return "app";
        }
        const candidates = (0, fs_1.readdirSync)(workspacePath, { withFileTypes: true })
            .filter((entry) => entry.isDirectory())
            .map((entry) => entry.name)
            .filter((name) => (0, fs_1.existsSync)((0, path_1.join)(workspacePath, name, "settings.py")))
            .sort();
        return candidates[0] || "app";
    }
    readDjangoSettings(workspacePath) {
        const projectName = this.detectDjangoProjectName(workspacePath);
        return this.readOptionalFile(workspacePath, (0, path_1.join)(projectName, "settings.py")) || "";
    }
    detectNodeDatabase(dependencies) {
        const names = Object.keys(dependencies);
        if (names.some((name) => ["pg", "postgres", "postgresql", "typeorm", "prisma", "sequelize"].includes(name))) {
            return "postgres";
        }
        if (names.some((name) => ["mysql", "mysql2"].includes(name))) {
            return "mysql";
        }
        if (names.some((name) => ["mongoose", "mongodb"].includes(name))) {
            return "mongodb";
        }
        if (names.some((name) => ["redis", "ioredis"].includes(name))) {
            return "redis";
        }
        return null;
    }
    detectPersistentStorage(workspacePath, rootFiles, profile, dependencies) {
        const storageDirs = ["uploads", "media", "storage"].filter((name) => rootFiles.has(name));
        const hasMulter = Boolean(dependencies.multer);
        const hasSqlite = this.hasSqliteUsage(workspacePath, rootFiles);
        if (storageDirs.length > 0 || hasMulter || hasSqlite) {
            profile.requiresPersistentStorage = true;
            profile.rawProfile.persistentStorageReason =
                storageDirs[0] ||
                    (hasMulter ? "multer dependency detected." : "sqlite file usage detected.");
        }
    }
    detectPythonPersistentStorage(workspacePath, rootFiles, profile, dependencyText) {
        const storageDirs = ["uploads", "media", "storage"].filter((name) => rootFiles.has(name));
        if (storageDirs.length > 0 || /sqlite|upload/.test(dependencyText)) {
            profile.requiresPersistentStorage = true;
            profile.rawProfile.persistentStorageReason =
                storageDirs[0] || "sqlite/upload usage detected.";
        }
    }
    hasSqliteUsage(workspacePath, rootFiles) {
        if (Array.from(rootFiles).some((file) => /\.(sqlite|sqlite3|db)$/.test(file))) {
            return true;
        }
        return ["package.json", "server.js", "app.js", "index.js"].some((file) => {
            const text = this.readOptionalFile(workspacePath, file);
            return text ? /sqlite/i.test(text) : false;
        });
    }
};
exports.StackDetectionService = StackDetectionService;
exports.StackDetectionService = StackDetectionService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [template_matching_service_1.TemplateMatchingService])
], StackDetectionService);
//# sourceMappingURL=stack-detection.service.js.map