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
exports.InfracostService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const child_process_1 = require("child_process");
const promises_1 = require("fs/promises");
const path_1 = require("path");
const util_1 = require("util");
const project_cost_resource_breakdown_entity_1 = require("./project-cost-resource-breakdown.entity");
const execFileAsync = (0, util_1.promisify)(child_process_1.execFile);
let InfracostService = class InfracostService {
    constructor(config) {
        this.config = config;
    }
    async runInfracostBreakdown(planJson, workdir) {
        const apiKey = this.config.get("INFRACOST_API_KEY");
        if (!apiKey) {
            throw new Error("INFRACOST_API_KEY is required when FINOPS_MOCK_MODE=false.");
        }
        const planJsonPath = (0, path_1.join)(workdir, "tfplan.json");
        await (0, promises_1.writeFile)(planJsonPath, planJson, "utf8");
        try {
            const { stdout } = await execFileAsync("infracost", ["breakdown", "--path", planJsonPath, "--format", "json"], {
                cwd: workdir,
                timeout: 10 * 60 * 1000,
                maxBuffer: 32 * 1024 * 1024,
                env: { ...process.env, INFRACOST_API_KEY: apiKey },
            });
            return stdout;
        }
        catch (error) {
            const err = error;
            if (err.code === "ENOENT") {
                throw new Error("infracost CLI is not installed or not available in PATH.");
            }
            throw new Error("Infracost cost breakdown failed.");
        }
    }
    parseInfracostResponse(rawJson) {
        try {
            return JSON.parse(rawJson || "{}");
        }
        catch {
            throw new Error("Invalid Infracost JSON output.");
        }
    }
    normalizeCostBreakdown(raw) {
        const projects = Array.isArray(raw.projects) ? raw.projects : [];
        const resources = projects.flatMap((project) => {
            const breakdown = project.breakdown;
            return Array.isArray(breakdown?.resources) ? breakdown.resources : [];
        });
        return resources.map((resource, index) => {
            const item = resource;
            const monthlyCost = Number(item.monthlyCost || 0);
            const name = String(item.name || item.resourceType || `resource-${index + 1}`);
            return {
                resourceType: this.mapResourceType(name),
                resourceName: name,
                serviceName: String(item.resourceType || "") || null,
                monthlyCost,
                metadata: { source: "infracost" },
            };
        });
    }
    mapResourceType(value) {
        const normalized = value.toLowerCase();
        if (/ecs|fargate/.test(normalized))
            return project_cost_resource_breakdown_entity_1.CostResourceType.ECS_FARGATE_COMPUTE;
        if (/load.?balancer|alb|elb/.test(normalized))
            return project_cost_resource_breakdown_entity_1.CostResourceType.LOAD_BALANCER;
        if (/rds|database|db_instance/.test(normalized))
            return project_cost_resource_breakdown_entity_1.CostResourceType.DATABASE;
        if (/s3|efs|ebs|storage|ecr/.test(normalized))
            return project_cost_resource_breakdown_entity_1.CostResourceType.STORAGE;
        if (/transfer|nat/.test(normalized))
            return project_cost_resource_breakdown_entity_1.CostResourceType.DATA_TRANSFER;
        if (/cloudwatch|logs/.test(normalized))
            return project_cost_resource_breakdown_entity_1.CostResourceType.CLOUDWATCH_LOGS;
        return project_cost_resource_breakdown_entity_1.CostResourceType.OTHER;
    }
};
exports.InfracostService = InfracostService;
exports.InfracostService = InfracostService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], InfracostService);
//# sourceMappingURL=infracost.service.js.map