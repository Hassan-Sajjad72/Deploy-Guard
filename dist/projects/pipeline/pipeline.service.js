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
Object.defineProperty(exports, "__esModule", { value: true });
exports.PipelineService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const bullmq_1 = require("bullmq");
const typeorm_2 = require("typeorm");
const audit_log_service_1 = require("../../audit-log/audit-log.service");
const project_detection_profile_entity_1 = require("../project-detection-profile.entity");
const project_preflight_report_entity_1 = require("../project-preflight-report.entity");
const project_pipeline_run_entity_1 = require("../project-pipeline-run.entity");
const project_pipeline_event_entity_1 = require("../project-pipeline-event.entity");
const projects_service_1 = require("../projects.service");
const pipeline_types_1 = require("./pipeline.types");
let PipelineService = class PipelineService {
    constructor(runRepository, eventRepository, profileRepository, preflightRepository, pipelineQueue, projectsService, auditLogService) {
        this.runRepository = runRepository;
        this.eventRepository = eventRepository;
        this.profileRepository = profileRepository;
        this.preflightRepository = preflightRepository;
        this.pipelineQueue = pipelineQueue;
        this.projectsService = projectsService;
        this.auditLogService = auditLogService;
    }
    async startRun(user, projectId, dto, req) {
        const project = await this.projectsService.getProjectEntityForManage(user, projectId);
        if (!project.repositoryUrl) {
            throw new common_1.BadRequestException("Project repository is not linked");
        }
        if (!project.targetBranch) {
            throw new common_1.BadRequestException("Project target branch is not selected");
        }
        const profile = await this.profileRepository.findOne({
            where: { projectId: project.id },
        });
        if (!profile) {
            throw new common_1.BadRequestException("Run stack detection before starting a pipeline");
        }
        const preflightReport = await this.preflightRepository.findOne({
            where: { projectId: project.id },
        });
        if (!preflightReport) {
            throw new common_1.BadRequestException("Generate a pre-flight report before starting a pipeline");
        }
        if (![
            project_preflight_report_entity_1.PreflightValidationStatus.PASSED,
            project_preflight_report_entity_1.PreflightValidationStatus.PASSED_WITH_WARNINGS,
        ].includes(preflightReport.validationStatus)) {
            throw new common_1.BadRequestException("Pipeline requires a passed pre-flight report or warnings-only report");
        }
        const options = {
            triggerGithubActions: true,
            buildImage: true,
            pushToEcr: true,
            runTerraform: true,
        };
        const pipelineRun = await this.runRepository.save(this.runRepository.create({
            projectId: project.id,
            triggeredByUserId: user.id,
            preflightReportId: preflightReport.id,
            detectionProfileId: profile.id,
            repositoryUrl: project.repositoryUrl,
            repositoryFullName: project.repositoryFullName,
            targetBranch: project.targetBranch,
            status: project_pipeline_run_entity_1.PipelineRunStatus.QUEUED,
            currentStage: "queued",
            metadata: { options },
        }));
        await this.eventRepository.save(this.eventRepository.create({
            pipelineRunId: pipelineRun.id,
            projectId: project.id,
            stage: "queued",
            status: "queued",
            message: "Pipeline run queued.",
            metadata: {
                projectId: project.id,
                pipelineRunId: pipelineRun.id,
                repositoryFullName: project.repositoryFullName,
                targetBranch: project.targetBranch,
                stage: "queued",
                status: "queued",
            },
        }));
        await this.pipelineQueue.add("runPipeline", {
            pipelineRunId: pipelineRun.id,
            projectId: project.id,
            triggeredByUserId: user.id,
            jobType: "pipeline_build",
            options,
        }, {
            attempts: Number(process.env.PIPELINE_JOB_ATTEMPTS || "1"),
            backoff: { type: "fixed", delay: 5000 },
        });
        await this.auditLogService.record({
            actorUser: user,
            action: "PIPELINE_RUN_QUEUED",
            resourceType: "pipeline_run",
            resourceId: pipelineRun.id,
            status: "success",
            metadata: {
                projectId: project.id,
                pipelineRunId: pipelineRun.id,
                repositoryFullName: project.repositoryFullName,
                targetBranch: project.targetBranch,
                stage: "queued",
                status: project_pipeline_run_entity_1.PipelineRunStatus.QUEUED,
            },
            req,
        });
        return this.toRunResponse(pipelineRun);
    }
    async listRuns(user, projectId) {
        const project = await this.projectsService.getProjectEntityForView(user, projectId);
        const runs = await this.runRepository.find({
            where: { projectId: project.id },
            order: { createdAt: "DESC" },
            take: 50,
        });
        return runs.map((run) => this.toRunResponse(run));
    }
    async getRun(user, projectId, runId) {
        const project = await this.projectsService.getProjectEntityForView(user, projectId);
        const run = await this.runRepository.findOne({
            where: { id: runId, projectId: project.id },
        });
        if (!run) {
            throw new common_1.NotFoundException("Pipeline run not found");
        }
        return this.toRunResponse(run);
    }
    async listEvents(user, projectId, runId) {
        const project = await this.projectsService.getProjectEntityForView(user, projectId);
        const run = await this.runRepository.findOne({
            where: { id: runId, projectId: project.id },
        });
        if (!run) {
            throw new common_1.NotFoundException("Pipeline run not found");
        }
        return this.eventRepository.find({
            where: { pipelineRunId: run.id, projectId: project.id },
            order: { createdAt: "ASC" },
        });
    }
    toRunResponse(run) {
        return {
            id: run.id,
            projectId: run.projectId,
            triggeredByUserId: run.triggeredByUserId,
            preflightReportId: run.preflightReportId,
            detectionProfileId: run.detectionProfileId,
            repositoryUrl: run.repositoryUrl,
            repositoryFullName: run.repositoryFullName,
            targetBranch: run.targetBranch,
            commitSha: run.commitSha,
            imageName: run.imageName,
            imageTag: run.imageTag,
            shortCommitSha: run.commitSha ? run.commitSha.slice(0, 12) : null,
            ecrRepositoryName: run.ecrRepositoryName,
            ecrImageUri: run.ecrImageUri,
            githubWorkflowRunId: run.githubWorkflowRunId,
            githubWorkflowStatus: run.githubWorkflowStatus,
            status: run.status,
            currentStage: run.currentStage,
            startedAt: run.startedAt,
            completedAt: run.completedAt,
            failedAt: run.failedAt,
            errorMessage: run.errorMessage,
            createdAt: run.createdAt,
            updatedAt: run.updatedAt,
        };
    }
};
exports.PipelineService = PipelineService;
exports.PipelineService = PipelineService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(project_pipeline_run_entity_1.ProjectPipelineRun)),
    __param(1, (0, typeorm_1.InjectRepository)(project_pipeline_event_entity_1.ProjectPipelineEvent)),
    __param(2, (0, typeorm_1.InjectRepository)(project_detection_profile_entity_1.ProjectDetectionProfile)),
    __param(3, (0, typeorm_1.InjectRepository)(project_preflight_report_entity_1.ProjectPreflightReport)),
    __param(4, (0, common_1.Inject)(pipeline_types_1.PIPELINE_QUEUE)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        bullmq_1.Queue,
        projects_service_1.ProjectsService,
        audit_log_service_1.AuditLogService])
], PipelineService);
//# sourceMappingURL=pipeline.service.js.map