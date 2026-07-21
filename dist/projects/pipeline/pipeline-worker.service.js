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
var PipelineWorkerService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PipelineWorkerService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const bullmq_1 = require("bullmq");
const child_process_1 = require("child_process");
const promises_1 = require("fs/promises");
const path_1 = require("path");
const util_1 = require("util");
const typeorm_2 = require("typeorm");
const audit_log_service_1 = require("../../audit-log/audit-log.service");
const finops_service_1 = require("../../finops/finops.service");
const project_cost_estimate_entity_1 = require("../../finops/project-cost-estimate.entity");
const infrastructure_service_1 = require("../../infrastructure/infrastructure.service");
const orchestration_service_1 = require("../../orchestration/orchestration.service");
const github_actions_metrics_service_1 = require("../../observability/github-actions-metrics.service");
const pipeline_metrics_service_1 = require("../../observability/pipeline-metrics.service");
const project_stage_metric_entity_1 = require("../../observability/project-stage-metric.entity");
const trivy_metrics_service_1 = require("../../observability/trivy-metrics.service");
const efs_service_1 = require("../../storage/efs.service");
const storage_service_1 = require("../../storage/storage.service");
const user_entity_1 = require("../../users/user.entity");
const project_detection_profile_entity_1 = require("../project-detection-profile.entity");
const project_preflight_report_entity_1 = require("../project-preflight-report.entity");
const project_entity_1 = require("../project.entity");
const project_pipeline_run_entity_1 = require("../project-pipeline-run.entity");
const project_pipeline_event_entity_1 = require("../project-pipeline-event.entity");
const project_security_scan_entity_1 = require("../project-security-scan.entity");
const docker_build_service_1 = require("./docker-build.service");
const ecr_service_1 = require("./ecr.service");
const github_actions_service_1 = require("./github-actions.service");
const terraform_service_1 = require("./terraform.service");
const security_scan_service_1 = require("../security/security-scan.service");
const redis_config_1 = require("./redis.config");
const pipeline_types_1 = require("./pipeline.types");
const execFileAsync = (0, util_1.promisify)(child_process_1.execFile);
const ALLOWED_METADATA_KEYS = [
    "projectId",
    "pipelineRunId",
    "repositoryFullName",
    "targetBranch",
    "commitSha",
    "imageTag",
    "shortCommitSha",
    "ecrRepositoryName",
    "ecrImageUri",
    "terraformConfigured",
    "terraformStatus",
    "terraformWorkingDirectory",
    "scanId",
    "criticalCount",
    "highCount",
    "mediumCount",
    "lowCount",
    "policyDecision",
    "estimateId",
    "totalMonthlyCost",
    "tierLimitMonthlyCost",
    "warningThresholdMonthlyCost",
    "approvalRequired",
    "blockedByTierLimit",
    "infrastructureEnvironmentId",
    "vpcId",
    "reason",
    "stage",
    "status",
    "storageId",
    "persistentStorageId",
    "efsFileSystemId",
    "efsAccessPointId",
    "backupPlanId",
    "backupVaultName",
    "deploymentId",
    "ecsClusterName",
    "ecsServiceName",
    "ecsServiceArn",
    "taskDefinitionArn",
    "albDnsName",
    "targetGroupArn",
    "toCommitSha",
];
let PipelineWorkerService = PipelineWorkerService_1 = class PipelineWorkerService {
    constructor(runRepository, eventRepository, projectRepository, profileRepository, preflightRepository, userRepository, config, auditLogService, githubActionsService, dockerBuildService, securityScanService, ecrService, terraformService, finopsService, infrastructureService, storageService, efsService, orchestrationService, pipelineMetricsService, githubActionsMetricsService, trivyMetricsService) {
        this.runRepository = runRepository;
        this.eventRepository = eventRepository;
        this.projectRepository = projectRepository;
        this.profileRepository = profileRepository;
        this.preflightRepository = preflightRepository;
        this.userRepository = userRepository;
        this.config = config;
        this.auditLogService = auditLogService;
        this.githubActionsService = githubActionsService;
        this.dockerBuildService = dockerBuildService;
        this.securityScanService = securityScanService;
        this.ecrService = ecrService;
        this.terraformService = terraformService;
        this.finopsService = finopsService;
        this.infrastructureService = infrastructureService;
        this.storageService = storageService;
        this.efsService = efsService;
        this.orchestrationService = orchestrationService;
        this.pipelineMetricsService = pipelineMetricsService;
        this.githubActionsMetricsService = githubActionsMetricsService;
        this.trivyMetricsService = trivyMetricsService;
        this.logger = new common_1.Logger(PipelineWorkerService_1.name);
        this.worker = null;
    }
    start() {
        if (this.worker) {
            return;
        }
        this.worker = new bullmq_1.Worker(pipeline_types_1.PIPELINE_QUEUE_NAME, (job) => this.process(job), {
            connection: (0, redis_config_1.createRedisConnection)(this.config),
            concurrency: 1,
        });
        this.worker.on("failed", (job, error) => {
            this.logger.error(`Pipeline job ${job?.id || "unknown"} failed`, error);
        });
        this.logger.log(`Pipeline worker listening on queue ${pipeline_types_1.PIPELINE_QUEUE_NAME}`);
    }
    async onModuleDestroy() {
        await this.worker?.close();
    }
    async process(job) {
        const { pipelineRunId, triggeredByUserId } = job.data;
        const run = await this.findRun(pipelineRunId);
        const actor = await this.userRepository.findOne({
            where: { id: triggeredByUserId },
        });
        let workspacePath = null;
        const jobType = job.data.jobType || "pipeline_build";
        try {
            if (jobType === "infrastructure_plan" || jobType === "infrastructure_apply") {
                await this.processInfrastructureOnlyJob(run, actor, jobType);
                return;
            }
            if (jobType === "storage_provision") {
                await this.processStorageProvisionJob(run, actor);
                return;
            }
            await this.updateRun(run, {
                status: project_pipeline_run_entity_1.PipelineRunStatus.RUNNING,
                currentStage: "preparing",
                startedAt: new Date(),
            });
            await this.audit("PIPELINE_RUN_STARTED", run, actor, "success", {
                stage: "preparing",
                status: project_pipeline_run_entity_1.PipelineRunStatus.RUNNING,
            });
            const { project, profile, preflightReport } = await this.prepare(run);
            await this.event(run, "preparing", "success", "Pipeline inputs validated.");
            if (jobType === "full_deploy") {
                await this.event(run, "readiness_check_started", "running", "Deployment readiness check started.");
                if (actor) {
                    const readiness = await this.infrastructureService.getDeploymentReadiness(actor, run.projectId);
                    if (!readiness.ready) {
                        await this.event(run, "readiness_check_failed", "failed", readiness.nextRequiredAction || "Deployment readiness check failed.");
                        throw new Error(readiness.nextRequiredAction || "Deployment readiness check failed.");
                    }
                }
                await this.event(run, "readiness_check_passed", "success", "Deployment readiness check passed.");
            }
            await this.triggerGithubActions(run, actor);
            workspacePath = await this.cloneRepository(run);
            await this.ensureDockerfile(run, workspacePath, preflightReport);
            await this.ensureDockerignore(run, workspacePath);
            const imageTag = this.fullCommitSha(run);
            const shortCommitSha = imageTag.slice(0, 12);
            const imageName = `mini-paas/${this.safeName(project.name)}`;
            run.imageName = imageName;
            run.imageTag = imageTag;
            await this.runRepository.save(run);
            await this.buildDockerImage(run, actor, workspacePath, imageName, imageTag);
            await this.runSecurityGate(run, actor, project, imageName, imageTag);
            const ecrRepositoryName = this.ecrService.getRepositoryName(project.name);
            run.ecrRepositoryName = ecrRepositoryName;
            await this.updateRun(run, { currentStage: "tagging_image" });
            if (this.ecrService.hasConfig()) {
                run.ecrImageUri = this.ecrService.getImageUri(ecrRepositoryName, imageTag);
            }
            await this.runRepository.save(run);
            await this.event(run, "tagging_image", "success", "Image tag metadata computed.", {
                imageTag,
                shortCommitSha,
                ecrRepositoryName,
                ecrImageUri: run.ecrImageUri,
            });
            await this.audit("IMAGE_TAGGED", run, actor, "success", {
                stage: "tagging_image",
                status: "success",
                imageTag,
                shortCommitSha,
                ecrRepositoryName,
                ecrImageUri: run.ecrImageUri,
            });
            await this.pushToEcr(run, actor, imageName, imageTag, ecrRepositoryName);
            await this.applyLifecyclePolicy(run, actor, ecrRepositoryName);
            if (jobType === "full_deploy") {
                const planReady = await this.runInfrastructurePlan(run, actor, project);
                if (!planReady) {
                    return;
                }
            }
            else {
                await this.runTerraformStage(run, actor, project);
            }
            const shouldContinue = await this.runCostAnalysis(run, actor, project);
            if (!shouldContinue) {
                return;
            }
            if (jobType === "full_deploy") {
                await this.runInfrastructureApply(run, actor, project);
                await this.runEcsDeployment(run, actor);
            }
            else {
                await this.recordProvisioningSkipped(run, actor);
            }
            await this.updateRun(run, {
                status: project_pipeline_run_entity_1.PipelineRunStatus.COMPLETED,
                currentStage: "completed",
                completedAt: new Date(),
            });
            await this.event(run, "completed", "success", "Pipeline run completed.", {
                commitSha: run.commitSha,
                imageTag: run.imageTag,
                shortCommitSha: run.commitSha?.slice(0, 12),
                ecrRepositoryName: run.ecrRepositoryName,
                ecrImageUri: run.ecrImageUri,
            });
            await this.audit("PIPELINE_RUN_COMPLETED", run, actor, "success", {
                stage: "completed",
                status: project_pipeline_run_entity_1.PipelineRunStatus.COMPLETED,
                commitSha: run.commitSha,
                imageTag: run.imageTag,
                shortCommitSha: run.commitSha?.slice(0, 12),
                ecrRepositoryName: run.ecrRepositoryName,
                ecrImageUri: run.ecrImageUri,
            });
            if (jobType === "full_deploy") {
                await this.audit("DEPLOYMENT_COMPLETED", run, actor, "success", {
                    stage: "deployment_completed",
                    status: project_pipeline_run_entity_1.PipelineRunStatus.COMPLETED,
                });
            }
            await this.buildMetricSummary(run);
        }
        catch (error) {
            const message = error instanceof Error ? error.message : "Pipeline worker failed unexpectedly";
            const publicMessage = this.publicErrorMessage(message);
            const failedStatus = jobType === "storage_provision"
                ? project_pipeline_run_entity_1.PipelineRunStatus.STORAGE_FAILED
                : project_pipeline_run_entity_1.PipelineRunStatus.FAILED;
            await this.updateRun(run, {
                status: failedStatus,
                currentStage: run.currentStage || "failed",
                failedAt: new Date(),
                errorMessage: publicMessage,
            });
            await this.event(run, run.currentStage || "failed", "failed", publicMessage);
            await this.audit("PIPELINE_RUN_FAILED", run, actor, "failed", {
                stage: run.currentStage || "failed",
                status: failedStatus,
            });
            if (jobType === "storage_provision") {
                await this.storageService.recordStorageEvent(run.projectId, run.id, "storage_provisioning_failed", "failed", publicMessage, actor, { reason: publicMessage });
                await this.audit("STORAGE_PROVISIONING_FAILED", run, actor, "failed", {
                    stage: run.currentStage || "failed",
                    status: failedStatus,
                    reason: publicMessage,
                });
            }
            if (jobType === "full_deploy") {
                await this.audit("DEPLOYMENT_FAILED", run, actor, "failed", {
                    stage: run.currentStage || "failed",
                    status: project_pipeline_run_entity_1.PipelineRunStatus.FAILED,
                });
            }
            await this.buildMetricSummary(run);
            throw error;
        }
        finally {
            if (workspacePath) {
                await (0, promises_1.rm)((0, path_1.resolve)(workspacePath, ".."), { recursive: true, force: true });
            }
        }
    }
    async processInfrastructureOnlyJob(run, actor, jobType) {
        await this.updateRun(run, {
            status: project_pipeline_run_entity_1.PipelineRunStatus.RUNNING,
            currentStage: jobType,
            startedAt: new Date(),
        });
        const project = await this.projectRepository.findOne({ where: { id: run.projectId } });
        if (!project || project.status === "archived") {
            throw new Error("Project is archived or no longer exists");
        }
        if (jobType === "infrastructure_plan") {
            const planReady = await this.runInfrastructurePlan(run, actor, project);
            if (!planReady) {
                return;
            }
        }
        else {
            const applyReady = await this.runInfrastructureApply(run, actor, project);
            if (!applyReady) {
                return;
            }
        }
        await this.updateRun(run, {
            status: project_pipeline_run_entity_1.PipelineRunStatus.COMPLETED,
            currentStage: `${jobType}_completed`,
            completedAt: new Date(),
        });
        await this.event(run, `${jobType}_completed`, "success", "Infrastructure job completed.");
    }
    async processStorageProvisionJob(run, actor) {
        await this.startMetric(run, "efs_provisioning", project_stage_metric_entity_1.StageMetricSource.TERRAFORM);
        await this.updateRun(run, {
            status: project_pipeline_run_entity_1.PipelineRunStatus.STORAGE_EVALUATION_RUNNING,
            currentStage: "storage_evaluation_started",
            startedAt: new Date(),
        });
        const project = await this.projectRepository.findOne({ where: { id: run.projectId } });
        if (!project || project.status === "archived") {
            throw new Error("Project is archived or no longer exists");
        }
        await this.event(run, "storage_evaluation_started", "running", "Persistent storage evaluation started.");
        await this.storageService.recordStorageEvent(project.id, run.id, "storage_evaluation_started", "running", "Persistent storage evaluation started.", actor);
        const storage = await this.efsService.provisionEfs(project.id, run.id);
        await this.updateRun(run, {
            status: project_pipeline_run_entity_1.PipelineRunStatus.STORAGE_PROVISIONING,
            currentStage: "efs_plan_started",
        });
        await this.event(run, "persistent_storage_required", "success", "Persistent storage is enabled for this project.", {
            storageId: storage.id,
        });
        await this.storageService.recordStorageEvent(project.id, run.id, "persistent_storage_required", "success", "Persistent storage is enabled for this project.", actor, { storageId: storage.id });
        const planReady = await this.runInfrastructurePlan(run, actor, project);
        if (!planReady) {
            return;
        }
        await this.event(run, "efs_plan_completed", "success", "EFS Terraform plan completed.");
        await this.storageService.recordStorageEvent(project.id, run.id, "efs_plan_completed", "success", "EFS Terraform plan completed.", actor);
        await this.updateRun(run, {
            status: project_pipeline_run_entity_1.PipelineRunStatus.BACKUP_CONFIGURING,
            currentStage: "backup_plan_configuring",
        });
        await this.event(run, "backup_plan_configuring", "running", "Backup plan configuration included in Terraform apply.");
        await this.storageService.recordStorageEvent(project.id, run.id, "backup_plan_configuring", "running", "Backup plan configuration included in Terraform apply.", actor);
        const applyReady = await this.runInfrastructureApply(run, actor, project);
        if (!applyReady) {
            return;
        }
        const savedStorage = await this.efsService.getEfsStatus(project.id);
        await this.event(run, "efs_file_system_created", "success", "EFS file system outputs saved.", {
            efsFileSystemId: savedStorage?.efsFileSystemId || undefined,
        });
        await this.event(run, "efs_mount_targets_created", "success", "EFS mount target outputs saved.");
        await this.event(run, "efs_access_point_created", "success", "EFS access point outputs saved.", {
            efsAccessPointId: savedStorage?.efsAccessPointId || undefined,
        });
        await this.event(run, "efs_kms_encryption_enabled", "success", "EFS KMS encryption is enabled.");
        await this.event(run, "efs_posix_permissions_configured", "success", "EFS POSIX permissions configured.");
        await this.event(run, "efs_outputs_saved", "success", "EFS Terraform outputs saved.", {
            storageId: savedStorage?.id || storage.id,
            efsFileSystemId: savedStorage?.efsFileSystemId || undefined,
            efsAccessPointId: savedStorage?.efsAccessPointId || undefined,
        });
        await this.event(run, "backup_plan_configured", "success", "AWS Backup plan configured.", {
            backupPlanId: savedStorage?.backupPlanId || undefined,
            backupVaultName: savedStorage?.backupVaultName || undefined,
        });
        await this.storageService.recordStorageEvent(project.id, run.id, "efs_outputs_saved", "success", "EFS Terraform outputs saved.", actor, {
            storageId: savedStorage?.id || storage.id,
            efsFileSystemId: savedStorage?.efsFileSystemId || undefined,
            efsAccessPointId: savedStorage?.efsAccessPointId || undefined,
        });
        await this.storageService.recordStorageEvent(project.id, run.id, "backup_plan_configured", "success", "AWS Backup plan configured.", actor, {
            backupPlanId: savedStorage?.backupPlanId || undefined,
            backupVaultName: savedStorage?.backupVaultName || undefined,
        });
        await this.updateRun(run, {
            status: project_pipeline_run_entity_1.PipelineRunStatus.STORAGE_PROVISIONED,
            currentStage: "storage_provisioned",
            completedAt: new Date(),
        });
        await this.event(run, "storage_provisioned", "success", "Persistent storage provisioning completed.");
        await this.audit("STORAGE_PROVISIONED", run, actor, "success", {
            stage: "storage_provisioned",
            status: project_pipeline_run_entity_1.PipelineRunStatus.STORAGE_PROVISIONED,
            storageId: savedStorage?.id || storage.id,
        });
        await this.completeMetric(run, "efs_provisioning", {
            storageId: savedStorage?.id || storage.id,
        });
    }
    async prepare(run) {
        const project = await this.projectRepository.findOne({ where: { id: run.projectId } });
        if (!project || project.status === "archived") {
            throw new Error("Project is archived or no longer exists");
        }
        if (!project.repositoryUrl || !project.targetBranch) {
            throw new Error("Project repository and target branch are required");
        }
        const profile = await this.profileRepository.findOne({
            where: { id: run.detectionProfileId, projectId: project.id },
        });
        if (!profile) {
            throw new Error("Detection profile is missing");
        }
        const preflightReport = await this.preflightRepository.findOne({
            where: { id: run.preflightReportId, projectId: project.id },
        });
        if (!preflightReport) {
            throw new Error("Pre-flight report is missing");
        }
        if (![
            project_preflight_report_entity_1.PreflightValidationStatus.PASSED,
            project_preflight_report_entity_1.PreflightValidationStatus.PASSED_WITH_WARNINGS,
        ].includes(preflightReport.validationStatus)) {
            throw new Error("Pre-flight report must pass before a pipeline can run");
        }
        return { project, profile, preflightReport };
    }
    async triggerGithubActions(run, actor) {
        await this.startMetric(run, "github_actions", project_stage_metric_entity_1.StageMetricSource.GITHUB_ACTIONS);
        await this.updateRun(run, { currentStage: "github_actions_trigger_started" });
        await this.event(run, "github_actions_trigger_started", "running", "GitHub Actions workflow dispatch started.");
        await this.audit("GITHUB_ACTIONS_WORKFLOW_TRIGGER_STARTED", run, actor, "success", {
            stage: "github_actions_trigger_started",
            status: "started",
        });
        try {
            const result = await this.githubActionsService.triggerWorkflow({
                repositoryFullName: run.repositoryFullName,
                targetBranch: run.targetBranch,
            });
            run.githubWorkflowRunId = result.workflowRunId;
            run.githubWorkflowStatus = result.status;
            await this.runRepository.save(run);
            await this.event(run, "github_actions_triggered", "success", "GitHub Actions workflow dispatch requested.");
            await this.audit("GITHUB_ACTIONS_WORKFLOW_TRIGGERED", run, actor, "success", {
                stage: "github_actions_triggered",
                status: result.status,
            });
            await this.githubActionsMetricsService.saveGithubActionsMetric(run.projectId, run.id).catch(() => this.completeMetric(run, "github_actions", { status: result.status }));
        }
        catch (error) {
            const message = error instanceof Error
                ? error.message
                : "GitHub Actions workflow dispatch failed.";
            run.githubWorkflowStatus = "failed";
            await this.runRepository.save(run);
            await this.event(run, "github_actions_trigger_failed", "failed", message);
            await this.audit("GITHUB_ACTIONS_WORKFLOW_TRIGGER_FAILED", run, actor, "failed", {
                stage: "github_actions_trigger_failed",
                status: "failed",
                reason: message,
            });
            await this.failMetric(run, "github_actions", message);
            throw error;
        }
    }
    async cloneRepository(run) {
        await this.startMetric(run, "repository_clone", project_stage_metric_entity_1.StageMetricSource.PIPELINE);
        await this.updateRun(run, { currentStage: "cloning" });
        this.validateRepositoryUrl(run.repositoryUrl);
        const workspaceRoot = (0, path_1.resolve)(process.cwd(), this.config.get("PIPELINE_WORKSPACE_DIR", ".workspace/pipeline"));
        const runRoot = (0, path_1.join)(workspaceRoot, run.id);
        const workspacePath = (0, path_1.join)(runRoot, "repository");
        await (0, promises_1.mkdir)(runRoot, { recursive: true });
        await execFileAsync("git", ["clone", "--depth", "1", "--branch", run.targetBranch, run.repositoryUrl, workspacePath], {
            timeout: 120000,
            maxBuffer: 2 * 1024 * 1024,
        }).catch(async (error) => {
            await this.failMetric(run, "repository_clone", error);
            throw error;
        });
        const { stdout } = await execFileAsync("git", ["rev-parse", "HEAD"], {
            cwd: workspacePath,
            timeout: 10000,
        });
        run.commitSha = stdout.trim();
        await this.runRepository.save(run);
        await this.event(run, "cloning", "success", "Repository cloned.", {
            commitSha: run.commitSha,
        });
        await this.completeMetric(run, "repository_clone", { commitSha: run.commitSha });
        return workspacePath;
    }
    async ensureDockerfile(run, workspacePath, preflightReport) {
        await this.updateRun(run, { currentStage: "dockerfile_generated" });
        const dockerfilePath = (0, path_1.join)(workspacePath, "Dockerfile");
        if (await this.exists(dockerfilePath)) {
            await this.event(run, "dockerfile_generated", "success", "Existing repository Dockerfile will be used.");
            return;
        }
        if (!preflightReport.generatedDockerfile) {
            throw new Error("No Dockerfile exists and no generated Dockerfile is available");
        }
        await (0, promises_1.writeFile)(dockerfilePath, preflightReport.generatedDockerfile, "utf8");
        await this.event(run, "dockerfile_generated", "success", "Generated Dockerfile was written to the pipeline workspace.");
    }
    async ensureDockerignore(run, workspacePath) {
        const dockerignorePath = (0, path_1.join)(workspacePath, ".dockerignore");
        if (await this.exists(dockerignorePath)) {
            return;
        }
        await (0, promises_1.writeFile)(dockerignorePath, [
            "node_modules",
            ".git",
            ".env",
            ".env.*",
            "dist",
            "build",
            "coverage",
            "*.log",
        ].join("\n"), "utf8");
        await this.event(run, "dockerignore_generated", "success", "Generated build-only .dockerignore in the pipeline workspace.");
    }
    async buildDockerImage(run, actor, workspacePath, imageName, imageTag) {
        await this.startMetric(run, "docker_build", project_stage_metric_entity_1.StageMetricSource.DOCKER, { imageTag });
        await this.updateRun(run, { currentStage: "building_image" });
        await this.audit("DOCKER_BUILD_STARTED", run, actor, "success", {
            stage: "building_image",
            status: "started",
            imageTag,
        });
        if (!(await this.dockerBuildService.isDockerAvailable())) {
            await this.audit("DOCKER_BUILD_FAILED", run, actor, "failed", {
                stage: "building_image",
                status: "failed",
                imageTag,
            });
            const error = new Error("Docker is not available. Start Docker and retry the pipeline.");
            await this.failMetric(run, "docker_build", error, { imageTag });
            throw error;
        }
        try {
            await this.dockerBuildService.buildImage({ workspacePath, imageName, imageTag });
        }
        catch (error) {
            await this.failMetric(run, "docker_build", error, { imageTag });
            throw error;
        }
        await this.event(run, "building_image", "success", "Docker image built.", {
            imageTag,
        });
        await this.audit("DOCKER_BUILD_COMPLETED", run, actor, "success", {
            stage: "building_image",
            status: "success",
            imageTag,
        });
        await this.completeMetric(run, "docker_build", { imageTag });
    }
    async runSecurityGate(run, actor, project, imageName, imageTag) {
        await this.startMetric(run, "trivy_scan", project_stage_metric_entity_1.StageMetricSource.TRIVY, { imageTag });
        await this.updateRun(run, { currentStage: "security_scan_started" });
        await this.event(run, "security_scan_started", "running", "Security scan started.", { imageTag });
        const scan = await this.securityScanService.scanImage({
            project,
            imageName: `${imageName}:${imageTag}`,
            pipelineRun: run,
            actorUser: actor,
        }).catch(async (error) => {
            await this.failMetric(run, "trivy_scan", error, { imageTag });
            throw error;
        });
        await this.event(run, "security_scan_completed", "success", "Security scan completed.", {
            scanId: scan.id,
            imageTag,
            criticalCount: scan.criticalCount,
            highCount: scan.highCount,
            mediumCount: scan.mediumCount,
            lowCount: scan.lowCount,
        });
        await this.event(run, "security_policy_evaluated", "success", scan.policyReason || "Security policy evaluated.", {
            scanId: scan.id,
            policyDecision: scan.policyDecision,
            criticalCount: scan.criticalCount,
            highCount: scan.highCount,
            mediumCount: scan.mediumCount,
            lowCount: scan.lowCount,
        });
        if (scan.policyDecision === project_security_scan_entity_1.SecurityPolicyDecision.ALLOWED ||
            scan.policyDecision === project_security_scan_entity_1.SecurityPolicyDecision.APPROVED_OVERRIDE) {
            await this.event(run, "security_gate_passed", "success", "Security gate passed.", { scanId: scan.id, policyDecision: scan.policyDecision });
            await this.trivyMetricsService.saveTrivyMetric(run.projectId, run.id);
            return;
        }
        if (scan.policyDecision === project_security_scan_entity_1.SecurityPolicyDecision.REQUIRES_APPROVAL) {
            await this.event(run, "security_approval_required", "failed", "Security scan requires manual approval before image push.", {
                scanId: scan.id,
                policyDecision: scan.policyDecision,
                reason: scan.policyReason,
            });
            await this.trivyMetricsService.saveTrivyMetric(run.projectId, run.id);
            await this.failMetric(run, "trivy_scan", "Security approval required before image push.", {
                scanId: scan.id,
                policyDecision: scan.policyDecision,
            });
            throw new Error("Security approval required before image push.");
        }
        await this.event(run, "security_gate_blocked", "failed", scan.policyReason || "Security gate blocked image push.", {
            scanId: scan.id,
            policyDecision: scan.policyDecision,
            reason: scan.policyReason,
        });
        await this.trivyMetricsService.saveTrivyMetric(run.projectId, run.id);
        await this.failMetric(run, "trivy_scan", scan.policyReason || "Security gate blocked image push.", {
            scanId: scan.id,
            policyDecision: scan.policyDecision,
        });
        throw new Error(scan.policyReason || "Security gate blocked image push.");
    }
    async pushToEcr(run, actor, imageName, imageTag, ecrRepositoryName) {
        await this.startMetric(run, "ecr_push", project_stage_metric_entity_1.StageMetricSource.ECR, { imageTag, ecrRepositoryName });
        await this.updateRun(run, { currentStage: "ecr_push_started" });
        if (!this.ecrService.hasConfig() || !run.ecrImageUri) {
            await this.event(run, "ecr_push_failed", "failed", "AWS ECR config is missing. Set AWS credentials/account config and retry.", {
                imageTag,
                ecrRepositoryName,
            });
            await this.audit("ECR_PUSH_FAILED", run, actor, "failed", {
                stage: "ecr_push_failed",
                status: "failed",
                imageTag,
                ecrRepositoryName,
            });
            const error = new Error("AWS ECR config is missing. Set AWS credentials/account config and retry.");
            await this.failMetric(run, "ecr_push", error, { imageTag, ecrRepositoryName });
            throw error;
        }
        try {
            await this.event(run, "ecr_config_validated", "success", "AWS ECR config validated.", {
                imageTag,
                ecrRepositoryName,
                ecrImageUri: run.ecrImageUri,
            });
            await this.audit("ECR_PUSH_STARTED", run, actor, "success", {
                stage: "ecr_push_started",
                status: "started",
                imageTag,
                ecrRepositoryName,
                ecrImageUri: run.ecrImageUri,
            });
            await this.ecrService.ensureRepository(ecrRepositoryName);
            await this.event(run, "ecr_repository_ready", "success", "ECR repository is ready.", {
                ecrRepositoryName,
            });
            await this.audit("ECR_REPOSITORY_READY", run, actor, "success", {
                stage: "ecr_repository_ready",
                status: "success",
                ecrRepositoryName,
            });
            await this.ecrService.loginDocker();
            await this.event(run, "ecr_docker_login_completed", "success", "Docker login to ECR completed.", {
                ecrRepositoryName,
            });
            await this.dockerBuildService.tagImage({
                localImageName: imageName,
                imageTag,
                ecrImageUri: run.ecrImageUri,
            });
            await this.event(run, "ecr_image_tagged", "success", "Image tagged with ECR URI.", {
                imageTag,
                ecrRepositoryName,
                ecrImageUri: run.ecrImageUri,
            });
            await this.dockerBuildService.pushImage(run.ecrImageUri);
            await this.event(run, "ecr_image_pushed", "success", "Image pushed to ECR.", {
                imageTag,
                ecrRepositoryName,
                ecrImageUri: run.ecrImageUri,
            });
            await this.audit("ECR_IMAGE_PUSHED", run, actor, "success", {
                stage: "ecr_image_pushed",
                status: "success",
                imageTag,
                ecrRepositoryName,
                ecrImageUri: run.ecrImageUri,
            });
            await this.completeMetric(run, "ecr_push", { imageTag, ecrRepositoryName });
        }
        catch (error) {
            const message = error instanceof Error ? error.message : "ECR push failed.";
            await this.event(run, "ecr_push_failed", "failed", this.publicErrorMessage(message), {
                imageTag,
                ecrRepositoryName,
                ecrImageUri: run.ecrImageUri,
            });
            await this.audit("ECR_PUSH_FAILED", run, actor, "failed", {
                stage: "ecr_push_failed",
                status: "failed",
                imageTag,
                ecrRepositoryName,
                ecrImageUri: run.ecrImageUri,
            });
            await this.failMetric(run, "ecr_push", message, { imageTag, ecrRepositoryName });
            throw error;
        }
    }
    async applyLifecyclePolicy(run, actor, ecrRepositoryName) {
        await this.updateRun(run, { currentStage: "ecr_lifecycle_policy_applied" });
        await this.ecrService.applyLifecyclePolicy(ecrRepositoryName);
        await this.event(run, "ecr_lifecycle_policy_applied", "success", "ECR lifecycle policy applied for untagged images older than 30 days.", { ecrRepositoryName });
        await this.audit("ECR_LIFECYCLE_POLICY_APPLIED", run, actor, "success", {
            stage: "ecr_lifecycle_policy_applied",
            status: "success",
            ecrRepositoryName,
        });
    }
    async runTerraformStage(run, actor, project) {
        const job = this.terraformService.prepareTerraformJob(project, run);
        await this.event(run, "terraform_stage_queued", "queued", "Terraform stage queued.", job);
        await this.audit("TERRAFORM_STAGE_QUEUED", run, actor, "success", {
            stage: "terraform_stage_queued",
            status: "queued",
            ...job,
        });
        try {
            await this.event(run, "terraform_plan_started", "running", "Terraform plan stage started.", job);
            await this.audit("TERRAFORM_PLAN_STARTED", run, actor, "success", {
                stage: "terraform_plan_started",
                status: "running",
                ...job,
            });
            const result = await this.terraformService.runTerraformPlan(project, run);
            if (result.terraformStatus === "skipped_not_configured") {
                await this.event(run, "terraform_plan_skipped_not_configured", "skipped", result.reason || "Terraform is not configured for this project.", result);
                await this.audit("TERRAFORM_PLAN_SKIPPED_NOT_CONFIGURED", run, actor, "success", {
                    stage: "terraform_plan_skipped_not_configured",
                    status: "skipped",
                    ...result,
                });
            }
            await this.event(run, "terraform_stage_completed", "success", "Terraform stage completed.", result);
            await this.audit("TERRAFORM_STAGE_COMPLETED", run, actor, "success", {
                stage: "terraform_stage_completed",
                status: "success",
                ...result,
            });
        }
        catch (error) {
            const message = error instanceof Error ? error.message : "Terraform stage failed.";
            await this.event(run, "terraform_stage_failed", "failed", message, {
                ...job,
                terraformStatus: "failed",
                reason: message,
            });
            await this.audit("TERRAFORM_STAGE_FAILED", run, actor, "failed", {
                stage: "terraform_stage_failed",
                status: "failed",
                ...job,
                terraformStatus: "failed",
                reason: message,
            });
            throw error;
        }
    }
    async runCostAnalysis(run, actor, project) {
        await this.startMetric(run, "finops_cost_analysis", project_stage_metric_entity_1.StageMetricSource.FINOPS);
        await this.updateRun(run, {
            status: project_pipeline_run_entity_1.PipelineRunStatus.COST_ANALYSIS_RUNNING,
            currentStage: "cost_analysis_started",
        });
        try {
            const estimate = await this.finopsService.generatePipelineEstimate({
                project,
                actorUser: actor,
                pipelineRun: run,
            });
            if (estimate.status === project_cost_estimate_entity_1.CostEstimateStatus.BLOCKED_BY_TIER_LIMIT) {
                await this.updateRun(run, {
                    status: project_pipeline_run_entity_1.PipelineRunStatus.BLOCKED_BY_COST_LIMIT,
                    currentStage: "deployment_blocked_by_cost_limit",
                    failedAt: new Date(),
                    errorMessage: estimate.upgradePromptMessage ||
                        "Estimated monthly cost exceeds the subscription tier limit.",
                });
                await this.failMetric(run, "finops_cost_analysis", "Estimated monthly cost exceeds the subscription tier limit.");
                return false;
            }
            if (estimate.status === project_cost_estimate_entity_1.CostEstimateStatus.APPROVAL_REQUIRED) {
                await this.updateRun(run, {
                    status: project_pipeline_run_entity_1.PipelineRunStatus.WAITING_FOR_COST_APPROVAL,
                    currentStage: "cost_approval_required",
                });
                await this.completeMetric(run, "finops_cost_analysis", { status: "approval_required" });
                return false;
            }
            if (estimate.status === project_cost_estimate_entity_1.CostEstimateStatus.FAILED) {
                await this.updateRun(run, {
                    status: project_pipeline_run_entity_1.PipelineRunStatus.COST_ANALYSIS_FAILED,
                    currentStage: "cost_analysis_failed",
                    failedAt: new Date(),
                    errorMessage: estimate.errorMessage || "Cost analysis failed.",
                });
                await this.failMetric(run, "finops_cost_analysis", estimate.errorMessage || "Cost analysis failed.");
                return false;
            }
            await this.completeMetric(run, "finops_cost_analysis", { estimateId: estimate.id });
            return true;
        }
        catch (error) {
            const message = error instanceof Error ? error.message : "Cost analysis failed.";
            await this.updateRun(run, {
                status: project_pipeline_run_entity_1.PipelineRunStatus.COST_ANALYSIS_FAILED,
                currentStage: "cost_analysis_failed",
                failedAt: new Date(),
                errorMessage: this.publicErrorMessage(message),
            });
            await this.failMetric(run, "finops_cost_analysis", message);
            throw error;
        }
    }
    async runInfrastructurePlan(run, actor, project) {
        await this.startMetric(run, "terraform_plan", project_stage_metric_entity_1.StageMetricSource.TERRAFORM);
        await this.updateRun(run, { currentStage: "infrastructure_plan_started" });
        await this.event(run, "infrastructure_plan_started", "running", "Infrastructure Terraform plan started.");
        const environment = await this.infrastructureService.runInfrastructurePlan(project.id, run.id, actor).catch(async (error) => {
            await this.failMetric(run, "terraform_plan", error);
            throw error;
        });
        if (environment.status === "queued") {
            await this.pipelineMetricsService.skipStage(run.projectId, run.id, "terraform_plan", "Infrastructure plan was queued.");
            return false;
        }
        await this.event(run, "infrastructure_plan_completed", "success", "Infrastructure Terraform plan completed.", {
            infrastructureEnvironmentId: environment.id,
            ...(environment.terraformPlanSummary || {}),
        });
        await this.completeMetric(run, "terraform_plan", {
            infrastructureEnvironmentId: environment.id,
        });
        return true;
    }
    async runInfrastructureApply(run, actor, project) {
        await this.startMetric(run, "terraform_apply", project_stage_metric_entity_1.StageMetricSource.TERRAFORM);
        await this.updateRun(run, { currentStage: "infrastructure_apply_started" });
        await this.event(run, "infrastructure_apply_started", "running", "Infrastructure Terraform apply started.");
        const environment = await this.infrastructureService.runInfrastructureApply(project.id, run.id, actor).catch(async (error) => {
            await this.failMetric(run, "terraform_apply", error);
            throw error;
        });
        if (environment.status === "queued") {
            await this.pipelineMetricsService.skipStage(run.projectId, run.id, "terraform_apply", "Infrastructure apply was queued.");
            return false;
        }
        await this.event(run, "infrastructure_apply_completed", "success", "Infrastructure Terraform apply completed.", {
            infrastructureEnvironmentId: environment.id,
            vpcId: environment.vpcId,
        });
        await this.completeMetric(run, "terraform_apply", {
            infrastructureEnvironmentId: environment.id,
        });
        return true;
    }
    async runEcsDeployment(run, actor) {
        await this.startMetric(run, "ecs_deployment", project_stage_metric_entity_1.StageMetricSource.ECS);
        await this.updateRun(run, {
            status: project_pipeline_run_entity_1.PipelineRunStatus.ECS_TASK_DEFINITION_REGISTERING,
            currentStage: "ecs_task_definition_registering",
        });
        await this.event(run, "ecs_cluster_ready", "success", "ECS cluster is ready.");
        await this.event(run, "fargate_spot_capacity_provider_configured", "success", "Fargate Spot capacity provider configured.");
        await this.audit("FARGATE_SPOT_CONFIGURED", run, actor, "success", {
            stage: "fargate_spot_capacity_provider_configured",
            status: "success",
        });
        try {
            await this.updateRun(run, {
                status: project_pipeline_run_entity_1.PipelineRunStatus.ECS_SERVICE_UPDATING,
                currentStage: "ecs_service_updating",
            });
            await this.event(run, "ecs_task_definition_registered", "success", "ECS task definition registered.");
            await this.audit("ECS_TASK_DEFINITION_REGISTERED", run, actor, "success", {
                stage: "ecs_task_definition_registered",
                status: "success",
            });
            await this.event(run, "alb_target_group_ready", "success", "ALB target group is ready.");
            await this.event(run, "alb_listener_ready", "success", "ALB listener is ready.");
            await this.event(run, "alb_health_check_configured", "success", "ALB health check configured.");
            await this.audit("ALB_HEALTH_CHECK_CONFIGURED", run, actor, "success", {
                stage: "alb_health_check_configured",
                status: "success",
            });
            await this.event(run, "ecs_service_deployment_started", "running", "ECS service deployment started.");
            await this.updateRun(run, {
                status: project_pipeline_run_entity_1.PipelineRunStatus.ECS_WAITING_FOR_STABILITY,
                currentStage: "ecs_service_stability_wait_started",
            });
            await this.event(run, "ecs_service_stability_wait_started", "running", "Waiting for ECS service stability.");
            const deployment = await this.orchestrationService.recordDeploymentFromInfrastructure(run.projectId, run.id, actor);
            await this.event(run, "autoscaling_target_registered", "success", "ECS auto-scaling target registered.", {
                deploymentId: deployment.id,
                ecsClusterName: deployment.ecsClusterName,
                ecsServiceName: deployment.ecsServiceName,
            });
            await this.event(run, "autoscaling_policy_configured", "success", "Target-tracking CPU auto-scaling configured.", {
                deploymentId: deployment.id,
            });
            await this.audit("AUTOSCALING_POLICY_CONFIGURED", run, actor, "success", {
                stage: "autoscaling_policy_configured",
                status: "success",
                deploymentId: deployment.id,
            });
            await this.event(run, "spot_interruption_rule_configured", "success", "EventBridge ECS interruption rule configured.", {
                deploymentId: deployment.id,
            });
            await this.audit("SPOT_INTERRUPTION_RULE_CONFIGURED", run, actor, "success", {
                stage: "spot_interruption_rule_configured",
                status: "success",
                deploymentId: deployment.id,
            });
            await this.event(run, "ecs_service_stable", "success", "ECS service reached stable state.", {
                deploymentId: deployment.id,
                ecsServiceArn: deployment.ecsServiceArn,
                taskDefinitionArn: deployment.taskDefinitionArn,
            });
            await this.event(run, "alb_targets_healthy", "success", "ALB targets are healthy.", {
                deploymentId: deployment.id,
                targetGroupArn: deployment.targetGroupArn,
                albDnsName: deployment.albDnsName,
            });
            await this.audit("ECS_SERVICE_STABLE", run, actor, "success", {
                stage: "ecs_service_stable",
                status: "success",
                deploymentId: deployment.id,
                taskDefinitionArn: deployment.taskDefinitionArn,
            });
            await this.audit("ALB_TARGETS_HEALTHY", run, actor, "success", {
                stage: "alb_targets_healthy",
                status: "success",
                deploymentId: deployment.id,
            });
            await this.updateRun(run, {
                status: project_pipeline_run_entity_1.PipelineRunStatus.ECS_SERVICE_HEALTHY,
                currentStage: "ecs_service_healthy",
            });
            await this.completeMetric(run, "ecs_deployment", { deploymentId: deployment.id });
        }
        catch (error) {
            const message = error instanceof Error ? error.message : "ECS deployment failed.";
            await this.updateRun(run, {
                status: project_pipeline_run_entity_1.PipelineRunStatus.ECS_DEPLOYMENT_FAILED,
                currentStage: "ecs_deployment_failed",
                errorMessage: this.publicErrorMessage(message),
            });
            await this.event(run, "ecs_service_unhealthy", "failed", this.publicErrorMessage(message));
            await this.audit("ECS_SERVICE_UNHEALTHY", run, actor, "failed", {
                stage: "ecs_service_unhealthy",
                status: "failed",
            });
            await this.failMetric(run, "ecs_deployment", message);
            await this.tryRollback(run, actor, this.publicErrorMessage(message));
            throw error;
        }
    }
    async tryRollback(run, actor, reason) {
        await this.startMetric(run, "rollback", project_stage_metric_entity_1.StageMetricSource.ROLLBACK, { reason });
        await this.updateRun(run, {
            status: project_pipeline_run_entity_1.PipelineRunStatus.ROLLBACK_STARTED,
            currentStage: "rollback_started",
        });
        await this.event(run, "rollback_started", "running", "Automatic rollback started.", { reason });
        await this.audit("ROLLBACK_STARTED", run, actor, "success", {
            stage: "rollback_started",
            status: "running",
            reason,
        });
        try {
            const result = await this.orchestrationService.rollback(actor || { id: run.triggeredByUserId, role: "admin" }, run.projectId, { reason });
            await this.updateRun(run, {
                status: project_pipeline_run_entity_1.PipelineRunStatus.ROLLBACK_SUCCEEDED,
                currentStage: "rollback_succeeded",
            });
            await this.event(run, "rollback_succeeded", "success", "Rollback completed.", {
                deploymentId: result.deployment.id,
                toCommitSha: result.release.commitSha,
            });
            await this.audit("ROLLBACK_SUCCEEDED", run, actor, "success", {
                stage: "rollback_succeeded",
                status: "success",
                deploymentId: result.deployment.id,
                toCommitSha: result.release.commitSha,
            });
            await this.completeMetric(run, "rollback", {
                deploymentId: result.deployment.id,
                toCommitSha: result.release.commitSha,
            });
        }
        catch (rollbackError) {
            const rollbackMessage = rollbackError instanceof Error ? rollbackError.message : "Rollback failed.";
            await this.updateRun(run, {
                status: project_pipeline_run_entity_1.PipelineRunStatus.ROLLBACK_FAILED,
                currentStage: "rollback_failed",
            });
            await this.event(run, "rollback_failed", "failed", rollbackMessage);
            await this.audit("ROLLBACK_FAILED", run, actor, "failed", {
                stage: "rollback_failed",
                status: "failed",
                reason: rollbackMessage,
            });
            await this.failMetric(run, "rollback", rollbackMessage);
        }
    }
    async recordProvisioningSkipped(run, actor) {
        await this.event(run, "provisioning_skipped_not_configured", "skipped", "Provisioning is not configured yet; module 6.8 will continue after the FinOps gate.");
        await this.audit("PROVISIONING_SKIPPED_NOT_CONFIGURED", run, actor, "success", {
            stage: "provisioning_skipped_not_configured",
            status: "skipped",
        });
    }
    async updateRun(run, patch) {
        Object.assign(run, patch);
        await this.runRepository.save(run);
    }
    async event(run, stage, status, message, metadata = {}) {
        await this.updateRun(run, { currentStage: stage });
        await this.eventRepository.save(this.eventRepository.create({
            pipelineRunId: run.id,
            projectId: run.projectId,
            stage,
            status,
            message,
            metadata: this.safeMetadata({
                projectId: run.projectId,
                pipelineRunId: run.id,
                repositoryFullName: run.repositoryFullName,
                targetBranch: run.targetBranch,
                commitSha: run.commitSha,
                stage,
                status,
                ...metadata,
            }),
        }));
    }
    async audit(action, run, actor, status, metadata) {
        await this.auditLogService.record({
            actorUser: actor,
            action,
            resourceType: "pipeline_run",
            resourceId: run.id,
            status,
            metadata: this.safeMetadata({
                projectId: run.projectId,
                pipelineRunId: run.id,
                repositoryFullName: run.repositoryFullName,
                targetBranch: run.targetBranch,
                commitSha: run.commitSha,
                imageTag: run.imageTag,
                ecrRepositoryName: run.ecrRepositoryName,
                ecrImageUri: run.ecrImageUri,
                ...metadata,
            }),
        });
    }
    async findRun(id) {
        const run = await this.runRepository.findOne({ where: { id } });
        if (!run) {
            throw new Error("Pipeline run not found");
        }
        return run;
    }
    safeMetadata(metadata) {
        return Object.entries(metadata).reduce((safe, [key, value]) => {
            if (ALLOWED_METADATA_KEYS.includes(key) && value !== undefined) {
                safe[key] = value;
            }
            return safe;
        }, {});
    }
    async startMetric(run, stageName, source, metadata = {}) {
        await this.pipelineMetricsService.startStage(run.projectId, run.id, stageName, source, this.safeMetadata(metadata));
    }
    async completeMetric(run, stageName, metadata = {}) {
        await this.pipelineMetricsService.completeStage(run.projectId, run.id, stageName, this.safeMetadata(metadata));
    }
    async failMetric(run, stageName, error, metadata = {}) {
        await this.pipelineMetricsService.failStage(run.projectId, run.id, stageName, error, this.safeMetadata(metadata));
    }
    async buildMetricSummary(run) {
        await this.pipelineMetricsService.buildPipelineSummary(run.projectId, run.id).catch(() => null);
    }
    async exists(path) {
        try {
            await (0, promises_1.stat)(path);
            await (0, promises_1.access)(path);
            return true;
        }
        catch {
            return false;
        }
    }
    validateRepositoryUrl(repositoryUrl) {
        if (!/^https:\/\/github\.com\/[^/\s]+\/[^/\s]+\/?$/.test(repositoryUrl)) {
            throw new Error("Only public HTTPS GitHub repository URLs are supported");
        }
    }
    fullCommitSha(run) {
        if (!run.commitSha || !/^[0-9a-f]{40}$/i.test(run.commitSha)) {
            throw new Error("Unable to determine full Git commit SHA for immutable image tag.");
        }
        return run.commitSha;
    }
    safeName(value) {
        return value
            .toLowerCase()
            .replace(/[^a-z0-9-]+/g, "-")
            .replace(/^-+|-+$/g, "")
            .slice(0, 80);
    }
    publicErrorMessage(message) {
        const safeMessages = [
            "GitHub Actions token is not configured.",
            "GitHub Actions workflow dispatch failed due to insufficient token permissions.",
            "GitHub Actions workflow dispatch failed.",
            "GitHub Actions workflow dispatch failed because the selected branch is invalid or the workflow is not dispatchable.",
            "GitHub Actions workflow dispatch failed because the GitHub rate limit was reached.",
        ];
        if (safeMessages.includes(message) ||
            /^GitHub Actions workflow .+ was not found in the selected repository branch\.$/.test(message)) {
            return message;
        }
        if (/token|secret|password|credential|authorization/i.test(message)) {
            return "Pipeline failed because required external service credentials are invalid or missing.";
        }
        return message;
    }
};
exports.PipelineWorkerService = PipelineWorkerService;
exports.PipelineWorkerService = PipelineWorkerService = PipelineWorkerService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(project_pipeline_run_entity_1.ProjectPipelineRun)),
    __param(1, (0, typeorm_1.InjectRepository)(project_pipeline_event_entity_1.ProjectPipelineEvent)),
    __param(2, (0, typeorm_1.InjectRepository)(project_entity_1.Project)),
    __param(3, (0, typeorm_1.InjectRepository)(project_detection_profile_entity_1.ProjectDetectionProfile)),
    __param(4, (0, typeorm_1.InjectRepository)(project_preflight_report_entity_1.ProjectPreflightReport)),
    __param(5, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        config_1.ConfigService,
        audit_log_service_1.AuditLogService,
        github_actions_service_1.GithubActionsService,
        docker_build_service_1.DockerBuildService,
        security_scan_service_1.SecurityScanService,
        ecr_service_1.EcrService,
        terraform_service_1.TerraformService,
        finops_service_1.FinopsService,
        infrastructure_service_1.InfrastructureService,
        storage_service_1.StorageService,
        efs_service_1.EfsService,
        orchestration_service_1.OrchestrationService,
        pipeline_metrics_service_1.PipelineMetricsService,
        github_actions_metrics_service_1.GithubActionsMetricsService,
        trivy_metrics_service_1.TrivyMetricsService])
], PipelineWorkerService);
//# sourceMappingURL=pipeline-worker.service.js.map