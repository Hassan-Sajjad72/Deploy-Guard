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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a, _b, _c, _d, _e, _f, _g;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ObservabilityController = void 0;
const common_1 = require("@nestjs/common");
const express_1 = require("express");
const require_role_guard_1 = require("../common/rbac/require-role.guard");
const user_entity_1 = require("../users/user.entity");
const observability_service_1 = require("./observability.service");
const sse_log_stream_service_1 = require("./sse-log-stream.service");
let ObservabilityController = class ObservabilityController {
    constructor(observabilityService, sseLogStreamService) {
        this.observabilityService = observabilityService;
        this.sseLogStreamService = sseLogStreamService;
    }
    summary(req, projectId) {
        return this.observabilityService.getSummary(req.user, projectId);
    }
    pipelineMetrics(req, projectId, pipelineRunId) {
        return this.observabilityService.getPipelineMetrics(req.user, projectId, pipelineRunId);
    }
    runtimeMetrics(req, projectId, source = "auto", range = "1h") {
        return this.observabilityService.getRuntimeMetrics(req.user, projectId, source, range);
    }
    logs(req, projectId, query) {
        return this.observabilityService.getLogs(req.user, projectId, this.normalizeLogQuery(query));
    }
    async streamLogs(req, response, projectId, query) {
        await this.observabilityService.findProjectForView(req.user, projectId);
        return this.sseLogStreamService.stream(projectId, this.normalizeLogQuery(query), response, req.user);
    }
    health(req, projectId) {
        return this.observabilityService.getHealth(req.user, projectId);
    }
    normalizeLogQuery(query) {
        return {
            ...query,
            limit: query.limit ? Number(query.limit) : undefined,
            stream: query.stream || "all",
        };
    }
};
exports.ObservabilityController = ObservabilityController;
__decorate([
    (0, common_1.Get)("summary"),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)("projectId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_a = typeof express_1.Request !== "undefined" && express_1.Request) === "function" ? _a : Object, String]),
    __metadata("design:returntype", void 0)
], ObservabilityController.prototype, "summary", null);
__decorate([
    (0, common_1.Get)("pipeline-metrics"),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)("projectId")),
    __param(2, (0, common_1.Query)("pipelineRunId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_b = typeof express_1.Request !== "undefined" && express_1.Request) === "function" ? _b : Object, String, String]),
    __metadata("design:returntype", void 0)
], ObservabilityController.prototype, "pipelineMetrics", null);
__decorate([
    (0, common_1.Get)("runtime-metrics"),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)("projectId")),
    __param(2, (0, common_1.Query)("source")),
    __param(3, (0, common_1.Query)("range")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_c = typeof express_1.Request !== "undefined" && express_1.Request) === "function" ? _c : Object, String, Object, Object]),
    __metadata("design:returntype", void 0)
], ObservabilityController.prototype, "runtimeMetrics", null);
__decorate([
    (0, common_1.Get)("logs"),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)("projectId")),
    __param(2, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_d = typeof express_1.Request !== "undefined" && express_1.Request) === "function" ? _d : Object, String, Object]),
    __metadata("design:returntype", void 0)
], ObservabilityController.prototype, "logs", null);
__decorate([
    (0, common_1.Get)("logs/stream"),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __param(2, (0, common_1.Param)("projectId")),
    __param(3, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_e = typeof express_1.Request !== "undefined" && express_1.Request) === "function" ? _e : Object, typeof (_f = typeof express_1.Response !== "undefined" && express_1.Response) === "function" ? _f : Object, String, Object]),
    __metadata("design:returntype", Promise)
], ObservabilityController.prototype, "streamLogs", null);
__decorate([
    (0, common_1.Get)("health"),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)("projectId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_g = typeof express_1.Request !== "undefined" && express_1.Request) === "function" ? _g : Object, String]),
    __metadata("design:returntype", void 0)
], ObservabilityController.prototype, "health", null);
exports.ObservabilityController = ObservabilityController = __decorate([
    (0, common_1.Controller)("api/projects/:projectId/observability"),
    (0, common_1.UseGuards)((0, require_role_guard_1.requireRole)([user_entity_1.UserRole.ADMIN, user_entity_1.UserRole.DEVELOPER, user_entity_1.UserRole.READONLY])),
    __metadata("design:paramtypes", [observability_service_1.ObservabilityService,
        sse_log_stream_service_1.SseLogStreamService])
], ObservabilityController);
//# sourceMappingURL=observability.controller.js.map