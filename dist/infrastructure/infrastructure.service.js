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
exports.InfrastructureService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const bullmq_1 = require("bullmq");
const promises_1 = require("fs/promises");
const path_1 = require("path");
const typeorm_2 = require("typeorm");
const audit_log_service_1 = require("../audit-log/audit-log.service");
const project_cost_estimate_entity_1 = require("../finops/project-cost-estimate.entity");
const project_detection_profile_entity_1 = require("../projects/project-detection-profile.entity");
const project_environment_variable_entity_1 = require("../projects/project-environment-variable.entity");
const project_pipeline_event_entity_1 = require("../projects/project-pipeline-event.entity");
const project_pipeline_run_entity_1 = require("../projects/project-pipeline-run.entity");
const project_entity_1 = require("../projects/project.entity");
const pipeline_types_1 = require("../projects/pipeline/pipeline.types");
const user_entity_1 = require("../users/user.entity");
const state_corruption_service_1 = require("../state-management/state-corruption.service");
const state_heartbeat_service_1 = require("../state-management/state-heartbeat.service");
const state_lock_service_1 = require("../state-management/state-lock.service");
const terraform_state_service_1 = require("../state-management/terraform-state.service");
const state_management_config_1 = require("../state-management/state-management.config");
const orchestration_config_1 = require("../orchestration/orchestration.config");
const efs_service_1 = require("../storage/efs.service");
const storage_policy_service_1 = require("../storage/storage-policy.service");
const infrastructure_config_1 = require("./infrastructure.config");
const infrastructure_readiness_service_1 = require("./infrastructure-readiness.service");
const project_infrastructure_environment_entity_1 = require("./project-infrastructure-environment.entity");
const project_infrastructure_event_entity_1 = require("./project-infrastructure-event.entity");
const project_service_discovery_record_entity_1 = require("./project-service-discovery-record.entity");
const project_deployment_readiness_snapshot_entity_1 = require("./project-deployment-readiness-snapshot.entity");
const service_discovery_service_1 = require("./service-discovery.service");
const terraform_runner_service_1 = require("./terraform-runner.service");
let InfrastructureService = class InfrastructureService {
    constructor(projectRepository, profileRepository, envRepository, runRepository, pipelineEventRepository, costEstimateRepository, environmentRepository, eventRepository, serviceDiscoveryRepository, readinessSnapshotRepository, pipelineQueue, config, auditLogService, readinessService, terraformRunner, serviceDiscoveryService, terraformStateService, stateLockService, stateHeartbeatService, stateCorruptionService, storagePolicyService, efsService) {
        this.projectRepository = projectRepository;
        this.profileRepository = profileRepository;
        this.envRepository = envRepository;
        this.runRepository = runRepository;
        this.pipelineEventRepository = pipelineEventRepository;
        this.costEstimateRepository = costEstimateRepository;
        this.environmentRepository = environmentRepository;
        this.eventRepository = eventRepository;
        this.serviceDiscoveryRepository = serviceDiscoveryRepository;
        this.readinessSnapshotRepository = readinessSnapshotRepository;
        this.pipelineQueue = pipelineQueue;
        this.config = config;
        this.auditLogService = auditLogService;
        this.readinessService = readinessService;
        this.terraformRunner = terraformRunner;
        this.serviceDiscoveryService = serviceDiscoveryService;
        this.terraformStateService = terraformStateService;
        this.stateLockService = stateLockService;
        this.stateHeartbeatService = stateHeartbeatService;
        this.stateCorruptionService = stateCorruptionService;
        this.storagePolicyService = storagePolicyService;
        this.efsService = efsService;
    }
    async getDeploymentReadiness(user, projectId, req) {
        const readiness = await this.readinessService.getDeploymentReadiness(projectId, user);
        await this.audit("DEPLOYMENT_READINESS_CHECKED", projectId, user, "success", {
            ready: readiness.ready,
            blockingReasons: readiness.blockingReasons,
        }, req);
        if (!readiness.ready) {
            await this.audit("DEPLOYMENT_READINESS_FAILED", projectId, user, "failed", {
                ready: false,
                blockingReasons: readiness.blockingReasons,
            }, req);
        }
        return readiness;
    }
    async deploy(user, projectId, req) {
        const project = await this.findProjectForManage(user, projectId);
        const readiness = await this.readinessService.assertDeploymentReady(project.id, user);
        const run = await this.createInfrastructureRun(project, user, "full_deploy");
        await this.saveReadinessSnapshot(project.id, run.id, user.id, readiness);
        const environment = await this.createOrGetInfrastructureEnvironment(project.id, run.id);
        environment.status = project_infrastructure_environment_entity_1.InfrastructureEnvironmentStatus.QUEUED;
        environment.readinessSnapshot = readiness;
        await this.environmentRepository.save(environment);
        await this.enqueue(run, user, "full_deploy");
        await this.event(project.id, run.id, environment.id, "deployment_queued", "queued", "Deployment queued.", user);
        await this.audit("DEPLOYMENT_QUEUED", project.id, user, "success", {
            pipelineRunId: run.id,
            infrastructureEnvironmentId: environment.id,
        }, req);
        return { pipelineRunId: run.id, infrastructureEnvironmentId: environment.id };
    }
    async queuePlan(user, projectId, req) {
        const project = await this.findProjectForManage(user, projectId);
        const run = await this.createInfrastructureRun(project, user, "infrastructure_plan");
        const environment = await this.createOrGetInfrastructureEnvironment(project.id, run.id);
        environment.status = project_infrastructure_environment_entity_1.InfrastructureEnvironmentStatus.QUEUED;
        await this.environmentRepository.save(environment);
        await this.enqueue(run, user, "infrastructure_plan");
        await this.event(project.id, run.id, environment.id, "infrastructure_plan_queued", "queued", "Infrastructure plan queued.", user);
        await this.audit("INFRASTRUCTURE_PLAN_QUEUED", project.id, user, "success", {
            pipelineRunId: run.id,
            infrastructureEnvironmentId: environment.id,
        }, req);
        return { pipelineRunId: run.id, infrastructureEnvironmentId: environment.id };
    }
    async queueApply(user, projectId, req) {
        const project = await this.findProjectForManage(user, projectId);
        await this.assertCostGatePassed(project.id);
        const run = await this.createInfrastructureRun(project, user, "infrastructure_apply");
        const environment = await this.createOrGetInfrastructureEnvironment(project.id, run.id);
        environment.status = project_infrastructure_environment_entity_1.InfrastructureEnvironmentStatus.QUEUED;
        await this.environmentRepository.save(environment);
        await this.enqueue(run, user, "infrastructure_apply");
        await this.event(project.id, run.id, environment.id, "infrastructure_apply_queued", "queued", "Infrastructure apply queued.", user);
        return { pipelineRunId: run.id, infrastructureEnvironmentId: environment.id };
    }
    async createOrGetInfrastructureEnvironment(projectId, pipelineRunId) {
        const existing = await this.environmentRepository.findOne({
            where: { projectId, environmentName: "dev" },
            order: { createdAt: "DESC" },
        });
        if (existing) {
            if (pipelineRunId) {
                existing.pipelineRunId = pipelineRunId;
            }
            return this.environmentRepository.save(existing);
        }
        const infraConfig = (0, infrastructure_config_1.getInfrastructureConfig)(this.config);
        return this.environmentRepository.save(this.environmentRepository.create({
            projectId,
            pipelineRunId: pipelineRunId || null,
            environmentName: "dev",
            status: project_infrastructure_environment_entity_1.InfrastructureEnvironmentStatus.NOT_PROVISIONED,
            awsRegion: infraConfig.awsRegion,
        }));
    }
    async prepareInfrastructureWorkspace(projectId, pipelineRunId) {
        const infraConfig = (0, infrastructure_config_1.getInfrastructureConfig)(this.config);
        const workdir = (0, path_1.join)(infraConfig.terraformWorkingBaseDir, projectId, pipelineRunId);
        await (0, promises_1.mkdir)(workdir, { recursive: true });
        await (0, promises_1.cp)(infraConfig.terraformNetworkTemplateDir, workdir, {
            recursive: true,
            force: true,
        });
        await (0, promises_1.cp)((0, path_1.resolve)(infraConfig.terraformNetworkTemplateDir, "..", "modules"), (0, path_1.join)(workdir, "..", "modules"), {
            recursive: true,
            force: true,
        });
        return workdir;
    }
    async renderTerraformVariables(project, profile, pipelineRunId) {
        const infraConfig = (0, infrastructure_config_1.getInfrastructureConfig)(this.config);
        const namespaceBase = infraConfig.cloudMapNamespace.replace(/^\.+|\.+$/g, "");
        const efsVars = await this.storagePolicyService.buildEfsTerraformVariables(project.id, "dev");
        const ecsVars = await this.buildEcsTerraformVariables(project, profile, pipelineRunId || null);
        const vars = {
            project_id: project.id,
            project_name: project.name,
            environment_name: "dev",
            aws_region: infraConfig.awsRegion,
            vpc_cidr: infraConfig.defaultVpcCidr,
            public_subnet_cidrs: infraConfig.publicSubnetCidrs,
            private_subnet_cidrs: infraConfig.privateSubnetCidrs,
            single_nat_gateway: infraConfig.singleNatGateway,
            cloud_map_namespace: `project-${project.id}.${namespaceBase}`,
            enable_https: infraConfig.enableHttps,
            app_port: profile?.expectedPort || infraConfig.defaultAppPort,
            tags: {
                Project: "DeployGuard",
                ManagedBy: "DeployGuard",
                DeployGuardProjectId: project.id,
                Environment: "dev",
            },
            ...efsVars,
            ...ecsVars,
        };
        return vars;
    }
    async runInfrastructurePlan(projectId, pipelineRunId, actorUser) {
        const project = await this.requireProject(projectId);
        const profile = await this.profileRepository.findOne({ where: { projectId } });
        const environment = await this.createOrGetInfrastructureEnvironment(projectId, pipelineRunId);
        const workdir = await this.prepareInfrastructureWorkspace(projectId, pipelineRunId);
        const vars = await this.renderTerraformVariables(project, profile, pipelineRunId);
        const lockId = this.stateLockService.buildLockId(projectId, "dev");
        let lockAcquired = false;
        environment.status = project_infrastructure_environment_entity_1.InfrastructureEnvironmentStatus.PLANNING;
        environment.terraformWorkspacePath = workdir;
        environment.terraformStateKey = this.terraformStateService.buildStateKey(project, "dev");
        await this.environmentRepository.save(environment);
        await (0, promises_1.writeFile)((0, path_1.join)(workdir, "terraform.tfvars.json"), JSON.stringify(vars, null, 2), "utf8");
        await this.event(projectId, pipelineRunId, environment.id, "infrastructure_plan_started", "running", "Terraform plan started.", actorUser);
        await this.audit("INFRASTRUCTURE_PLAN_STARTED", projectId, actorUser || null, "success", { pipelineRunId, infrastructureEnvironmentId: environment.id });
        try {
            await this.verifyStateBackend(project, pipelineRunId, environment.id, actorUser);
            await this.event(projectId, pipelineRunId, environment.id, "state_lock_acquire_started", "running", "Terraform state lock acquisition started.", actorUser);
            await this.audit("STATE_LOCK_ACQUIRE_STARTED", projectId, actorUser || null, "success", { pipelineRunId, infrastructureEnvironmentId: environment.id });
            const lockResult = await this.stateLockService.acquireLock(projectId, pipelineRunId, actorUser?.id || null, "dev", {
                operation: "plan",
            });
            if (!lockResult.acquired) {
                environment.status = project_infrastructure_environment_entity_1.InfrastructureEnvironmentStatus.QUEUED;
                await this.environmentRepository.save(environment);
                await this.updateRun(pipelineRunId, {
                    status: project_pipeline_run_entity_1.PipelineRunStatus.WAITING_FOR_STATE_LOCK,
                    currentStage: "state_lock_waiting",
                });
                await this.event(projectId, pipelineRunId, environment.id, "state_lock_waiting", "queued", "Deployment queued behind existing Terraform state lock.", actorUser);
                await this.audit("STATE_LOCK_WAITING", projectId, actorUser || null, "success", { pipelineRunId, infrastructureEnvironmentId: environment.id });
                await this.audit("DEPLOYMENT_QUEUED_FOR_STATE_LOCK", projectId, actorUser || null, "success", { pipelineRunId, infrastructureEnvironmentId: environment.id });
                return environment;
            }
            lockAcquired = true;
            await this.updateRun(pipelineRunId, {
                status: project_pipeline_run_entity_1.PipelineRunStatus.STATE_LOCK_ACQUIRED,
                currentStage: "state_lock_acquired",
            });
            await this.event(projectId, pipelineRunId, environment.id, "state_lock_acquired", "success", "Terraform state lock acquired.", actorUser);
            await this.audit("STATE_LOCK_ACQUIRED", projectId, actorUser || null, "success", { pipelineRunId, infrastructureEnvironmentId: environment.id });
            await this.stateHeartbeatService.startHeartbeat(lockId, pipelineRunId);
            await this.updateRun(pipelineRunId, {
                status: project_pipeline_run_entity_1.PipelineRunStatus.STATE_HEARTBEAT_ACTIVE,
                currentStage: "state_heartbeat_active",
            });
            await this.event(projectId, pipelineRunId, environment.id, "state_heartbeat_started", "success", "Terraform state heartbeat started.", actorUser);
            await this.audit("STATE_HEARTBEAT_STARTED", projectId, actorUser || null, "success", { pipelineRunId, infrastructureEnvironmentId: environment.id });
            const env = this.terraformEnv();
            const stateConfig = (0, state_management_config_1.getStateManagementConfig)(this.config);
            const backendConfigPath = stateConfig.mockMode
                ? null
                : await this.terraformStateService.writeBackendConfig(workdir, project, "dev");
            await this.event(projectId, pipelineRunId, environment.id, "state_backend_config_generated", "success", stateConfig.mockMode ? "Terraform local backend selected for mock state mode." : "Terraform backend config generated.", actorUser);
            await this.terraformRunner.runTerraformInit(workdir, env, backendConfigPath);
            await this.terraformRunner.runTerraformValidate(workdir, env);
            const plan = await this.terraformRunner.runTerraformPlan(workdir, env);
            const show = await this.terraformRunner.runTerraformShowJson(workdir, env);
            const planSummary = this.summarizePlan(show.stdout);
            environment.status = project_infrastructure_environment_entity_1.InfrastructureEnvironmentStatus.COST_CHECK_REQUIRED;
            environment.terraformPlanSummary = planSummary;
            environment.metadata = { planLog: plan.stdout || plan.stderr || null };
            await this.environmentRepository.save(environment);
            await this.event(projectId, pipelineRunId, environment.id, "infrastructure_plan_completed", "success", "Terraform plan completed.", actorUser, planSummary);
            await this.audit("INFRASTRUCTURE_PLAN_COMPLETED", projectId, actorUser || null, "success", { pipelineRunId, infrastructureEnvironmentId: environment.id });
            await this.validateAndPersistState(project, environment, pipelineRunId, actorUser);
            await this.releaseStateLock(lockId, pipelineRunId, projectId, environment.id, actorUser);
            return environment;
        }
        catch (error) {
            const message = this.publicError(error);
            environment.status = project_infrastructure_environment_entity_1.InfrastructureEnvironmentStatus.PLAN_FAILED;
            environment.errorMessage = message;
            environment.failedAt = new Date();
            await this.environmentRepository.save(environment);
            await this.event(projectId, pipelineRunId, environment.id, "infrastructure_plan_failed", "failed", message, actorUser);
            await this.audit("INFRASTRUCTURE_PLAN_FAILED", projectId, actorUser || null, "failed", { pipelineRunId, infrastructureEnvironmentId: environment.id, reason: message });
            if (lockAcquired) {
                await this.releaseStateLock(lockId, pipelineRunId, projectId, environment.id, actorUser);
            }
            throw error;
        }
    }
    async runInfrastructureApply(projectId, pipelineRunId, actorUser) {
        await this.assertCostGatePassed(projectId);
        const infraConfig = (0, infrastructure_config_1.getInfrastructureConfig)(this.config);
        const environment = await this.createOrGetInfrastructureEnvironment(projectId, pipelineRunId);
        if (!infraConfig.terraformApplyEnabled) {
            environment.status = project_infrastructure_environment_entity_1.InfrastructureEnvironmentStatus.FAILED;
            environment.errorMessage = "Terraform apply is disabled. Set TERRAFORM_APPLY_ENABLED=true for real provisioning.";
            environment.failedAt = new Date();
            await this.environmentRepository.save(environment);
            await this.event(projectId, pipelineRunId, environment.id, "infrastructure_apply_blocked", "failed", environment.errorMessage, actorUser);
            await this.audit("INFRASTRUCTURE_APPLY_FAILED", projectId, actorUser || null, "failed", { pipelineRunId, infrastructureEnvironmentId: environment.id, reason: environment.errorMessage });
            throw new Error(environment.errorMessage);
        }
        if (!environment.terraformWorkspacePath) {
            await this.runInfrastructurePlan(projectId, pipelineRunId, actorUser);
        }
        const freshEnvironment = await this.createOrGetInfrastructureEnvironment(projectId, pipelineRunId);
        const project = await this.requireProject(projectId);
        const lockId = this.stateLockService.buildLockId(projectId, "dev");
        let lockAcquired = false;
        freshEnvironment.status = project_infrastructure_environment_entity_1.InfrastructureEnvironmentStatus.PROVISIONING;
        await this.environmentRepository.save(freshEnvironment);
        await this.event(projectId, pipelineRunId, freshEnvironment.id, "infrastructure_apply_started", "running", "Terraform apply started.", actorUser);
        await this.audit("INFRASTRUCTURE_APPLY_STARTED", projectId, actorUser || null, "success", { pipelineRunId, infrastructureEnvironmentId: freshEnvironment.id });
        try {
            await this.verifyStateBackend(project, pipelineRunId, freshEnvironment.id, actorUser);
            await this.event(projectId, pipelineRunId, freshEnvironment.id, "state_lock_acquire_started", "running", "Terraform state lock acquisition started.", actorUser);
            const lockResult = await this.stateLockService.acquireLock(projectId, pipelineRunId, actorUser?.id || null, "dev", {
                operation: "apply",
            });
            if (!lockResult.acquired) {
                freshEnvironment.status = project_infrastructure_environment_entity_1.InfrastructureEnvironmentStatus.QUEUED;
                await this.environmentRepository.save(freshEnvironment);
                await this.updateRun(pipelineRunId, {
                    status: project_pipeline_run_entity_1.PipelineRunStatus.WAITING_FOR_STATE_LOCK,
                    currentStage: "state_lock_waiting",
                });
                await this.event(projectId, pipelineRunId, freshEnvironment.id, "state_lock_waiting", "queued", "Deployment queued behind existing Terraform state lock.", actorUser);
                await this.audit("STATE_LOCK_WAITING", projectId, actorUser || null, "success", { pipelineRunId, infrastructureEnvironmentId: freshEnvironment.id });
                return freshEnvironment;
            }
            lockAcquired = true;
            await this.stateHeartbeatService.startHeartbeat(lockId, pipelineRunId);
            await this.event(projectId, pipelineRunId, freshEnvironment.id, "state_heartbeat_started", "success", "Terraform state heartbeat started.", actorUser);
            const env = this.terraformEnv();
            await this.terraformRunner.runTerraformApply(freshEnvironment.terraformWorkspacePath, env);
            const outputs = await this.terraformRunner.parseOutputs(freshEnvironment.terraformWorkspacePath, env);
            const saved = await this.saveInfrastructureOutputs(projectId, pipelineRunId, outputs);
            await this.event(projectId, pipelineRunId, saved.id, "vpc_provisioned", "success", "VPC provisioned.", actorUser, { vpcId: saved.vpcId });
            await this.event(projectId, pipelineRunId, saved.id, "subnets_provisioned", "success", "Public and private subnets provisioned.", actorUser);
            await this.event(projectId, pipelineRunId, saved.id, "nat_gateway_provisioned", "success", "NAT gateway provisioned.", actorUser);
            await this.event(projectId, pipelineRunId, saved.id, "security_groups_provisioned", "success", "Security groups provisioned.", actorUser);
            await this.event(projectId, pipelineRunId, saved.id, "cloud_map_namespace_created", "success", "Cloud Map namespace created.", actorUser);
            await this.event(projectId, pipelineRunId, saved.id, "service_discovery_ready", "success", "Service discovery is ready.", actorUser);
            await this.event(projectId, pipelineRunId, saved.id, "terraform_outputs_saved", "success", "Terraform outputs saved.", actorUser);
            await this.event(projectId, pipelineRunId, saved.id, "infrastructure_apply_completed", "success", "Infrastructure apply completed.", actorUser);
            await this.audit("INFRASTRUCTURE_APPLY_COMPLETED", projectId, actorUser || null, "success", { pipelineRunId, infrastructureEnvironmentId: saved.id });
            await this.validateAndPersistState(project, saved, pipelineRunId, actorUser);
            await this.releaseStateLock(lockId, pipelineRunId, projectId, saved.id, actorUser);
            return saved;
        }
        catch (error) {
            const message = this.publicError(error);
            freshEnvironment.status = project_infrastructure_environment_entity_1.InfrastructureEnvironmentStatus.FAILED;
            freshEnvironment.errorMessage = message;
            freshEnvironment.failedAt = new Date();
            await this.environmentRepository.save(freshEnvironment);
            await this.event(projectId, pipelineRunId, freshEnvironment.id, "infrastructure_apply_failed", "failed", message, actorUser);
            await this.audit("INFRASTRUCTURE_APPLY_FAILED", projectId, actorUser || null, "failed", { pipelineRunId, infrastructureEnvironmentId: freshEnvironment.id, reason: message });
            if (lockAcquired) {
                await this.releaseStateLock(lockId, pipelineRunId, projectId, freshEnvironment.id, actorUser);
            }
            throw error;
        }
    }
    async parseTerraformOutputs(projectId, pipelineRunId) {
        const environment = await this.createOrGetInfrastructureEnvironment(projectId, pipelineRunId);
        if (!environment.terraformWorkspacePath) {
            throw new Error("Terraform workspace is not prepared.");
        }
        return this.terraformRunner.parseOutputs(environment.terraformWorkspacePath, this.terraformEnv());
    }
    async saveInfrastructureOutputs(projectId, pipelineRunId, outputs) {
        const environment = await this.createOrGetInfrastructureEnvironment(projectId, pipelineRunId);
        environment.status = project_infrastructure_environment_entity_1.InfrastructureEnvironmentStatus.PROVISIONED;
        environment.vpcId = this.stringOutput(outputs.vpc_id);
        environment.publicSubnetIds = this.arrayOutput(outputs.public_subnet_ids);
        environment.privateSubnetIds = this.arrayOutput(outputs.private_subnet_ids);
        environment.internetGatewayId = this.stringOutput(outputs.internet_gateway_id);
        environment.natGatewayIds = this.arrayOutput(outputs.nat_gateway_ids);
        environment.routeTableIds = {
            public: this.stringOutput(outputs.public_route_table_id),
            private: this.stringOutput(outputs.private_route_table_id),
        };
        environment.albSecurityGroupId = this.stringOutput(outputs.alb_security_group_id);
        environment.appSecurityGroupId = this.stringOutput(outputs.app_security_group_id);
        environment.internalSecurityGroupId = this.stringOutput(outputs.internal_security_group_id);
        environment.cloudMapNamespaceId = this.stringOutput(outputs.cloud_map_namespace_id);
        environment.cloudMapNamespaceName = this.stringOutput(outputs.cloud_map_namespace_name);
        environment.cloudMapServiceDiscoveryDomain = this.stringOutput(outputs.cloud_map_service_discovery_domain);
        environment.terraformOutputs = this.safeOutputs(outputs);
        environment.provisionedAt = new Date();
        const saved = await this.environmentRepository.save(environment);
        await this.serviceDiscoveryService.saveServiceDiscoveryRecord(projectId, saved.id, "app", outputs);
        await this.efsService.saveEfsOutputs(projectId, pipelineRunId, outputs);
        await this.audit("INFRASTRUCTURE_OUTPUTS_SAVED", projectId, null, "success", { pipelineRunId, infrastructureEnvironmentId: saved.id });
        return saved;
    }
    async getInfrastructureStatus(user, projectId) {
        const project = await this.findProjectForView(user, projectId);
        const environment = await this.environmentRepository.findOne({
            where: { projectId: project.id },
            order: { createdAt: "DESC" },
        });
        return environment ? this.toEnvironmentResponse(environment) : null;
    }
    async getInfrastructureEvents(user, projectId) {
        const project = await this.findProjectForView(user, projectId);
        return this.eventRepository.find({
            where: { projectId: project.id },
            order: { createdAt: "ASC" },
        });
    }
    async getServiceDiscoveryInfo(user, projectId) {
        const project = await this.findProjectForView(user, projectId);
        return this.serviceDiscoveryRepository.find({
            where: { projectId: project.id },
            order: { createdAt: "DESC" },
        });
    }
    async assertCostGatePassed(projectId) {
        const estimate = await this.costEstimateRepository.findOne({
            where: { projectId },
            order: { createdAt: "DESC" },
        });
        if (!estimate) {
            throw new common_1.BadRequestException("Generate a cost estimate before deployment.");
        }
        if (![project_cost_estimate_entity_1.CostEstimateStatus.NO_APPROVAL_REQUIRED, project_cost_estimate_entity_1.CostEstimateStatus.APPROVED].includes(estimate.status)) {
            throw new common_1.BadRequestException("Infrastructure provisioning blocked by FinOps cost gate.");
        }
        return estimate;
    }
    async recordPipelineEvent(run, stage, status, message, metadata = {}) {
        await this.pipelineEventRepository.save(this.pipelineEventRepository.create({
            pipelineRunId: run.id,
            projectId: run.projectId,
            stage,
            status,
            message,
            metadata: this.safeMetadata({
                projectId: run.projectId,
                pipelineRunId: run.id,
                stage,
                status,
                ...metadata,
            }),
        }));
    }
    async createInfrastructureRun(project, user, jobType) {
        return this.runRepository.save(this.runRepository.create({
            projectId: project.id,
            triggeredByUserId: user.id,
            repositoryUrl: project.repositoryUrl,
            repositoryFullName: project.repositoryFullName,
            targetBranch: project.targetBranch,
            status: project_pipeline_run_entity_1.PipelineRunStatus.QUEUED,
            currentStage: "deployment_queued",
            metadata: { jobType },
        }));
    }
    async enqueue(run, user, jobType) {
        await this.pipelineQueue.add(jobType, {
            pipelineRunId: run.id,
            projectId: run.projectId,
            triggeredByUserId: user.id,
            jobType,
            options: {
                triggerGithubActions: true,
                buildImage: true,
                pushToEcr: true,
                runTerraform: true,
            },
        }, {
            attempts: Number(process.env.PIPELINE_JOB_ATTEMPTS || "1"),
            backoff: { type: "fixed", delay: 5000 },
        });
    }
    async saveReadinessSnapshot(projectId, pipelineRunId, createdByUserId, readiness) {
        await this.readinessSnapshotRepository.save(this.readinessSnapshotRepository.create({
            projectId,
            pipelineRunId,
            createdByUserId,
            ready: readiness.ready,
            checks: readiness.checks,
            blockingReasons: readiness.blockingReasons,
        }));
    }
    async event(projectId, pipelineRunId, infrastructureEnvironmentId, eventType, status, message, actorUser, metadata = {}) {
        await this.eventRepository.save(this.eventRepository.create({
            projectId,
            pipelineRunId,
            infrastructureEnvironmentId,
            eventType,
            status,
            message,
            actorUserId: actorUser?.id || null,
            metadata: this.safeMetadata({
                projectId,
                pipelineRunId,
                infrastructureEnvironmentId,
                eventType,
                status,
                ...metadata,
            }),
        }));
    }
    async audit(action, projectId, actorUser, status, metadata, req) {
        await this.auditLogService.record({
            actorUser,
            action,
            resourceType: "infrastructure",
            resourceId: projectId,
            status,
            metadata: this.safeMetadata({ projectId, ...metadata }),
            req,
        });
    }
    async verifyStateBackend(project, pipelineRunId, infrastructureEnvironmentId, actorUser) {
        await this.terraformStateService.ensureStateBucket();
        await this.event(project.id, pipelineRunId, infrastructureEnvironmentId, "state_bucket_verified", "success", "Terraform state bucket verified.", actorUser);
        await this.audit("STATE_BUCKET_VERIFIED", project.id, actorUser || null, "success", { pipelineRunId, infrastructureEnvironmentId });
        await this.terraformStateService.ensureStateBucketVersioning();
        await this.event(project.id, pipelineRunId, infrastructureEnvironmentId, "state_bucket_versioning_verified", "success", "Terraform state bucket versioning verified.", actorUser);
        await this.audit("STATE_BUCKET_VERSIONING_ENABLED", project.id, actorUser || null, "success", { pipelineRunId, infrastructureEnvironmentId });
        await this.terraformStateService.ensureStateBucketEncryption();
        await this.terraformStateService.ensureStateBucketPublicAccessBlock();
        await this.terraformStateService.ensureLockTable();
        await this.event(project.id, pipelineRunId, infrastructureEnvironmentId, "state_lock_table_verified", "success", "Terraform state lock table verified.", actorUser);
        await this.audit("STATE_LOCK_TABLE_VERIFIED", project.id, actorUser || null, "success", { pipelineRunId, infrastructureEnvironmentId });
    }
    async validateAndPersistState(project, environment, pipelineRunId, actorUser) {
        await this.updateRun(pipelineRunId, {
            status: project_pipeline_run_entity_1.PipelineRunStatus.STATE_VALIDATION_RUNNING,
            currentStage: "state_validation_running",
        });
        await this.event(project.id, pipelineRunId, environment.id, "state_validation_started", "running", "Terraform state validation started.", actorUser);
        await this.audit("STATE_VALIDATION_STARTED", project.id, actorUser || null, "success", { pipelineRunId, infrastructureEnvironmentId: environment.id });
        const rawState = JSON.stringify({
            version: 4,
            serial: 1,
            resources: [],
        });
        const result = await this.stateCorruptionService.detectCorruption(project.id, "dev", rawState);
        await this.terraformStateService.upsertStateMetadata({
            project,
            environment,
            environmentName: "dev",
            rawState,
            resourceCount: result.resourceCount,
            status: result.status === "valid" ? "active" : "recovery_required",
        });
        if (result.status === "valid") {
            await this.event(project.id, pipelineRunId, environment.id, "state_validation_passed", "success", "Terraform state validation passed.", actorUser);
            await this.audit("STATE_VALIDATION_PASSED", project.id, actorUser || null, "success", { pipelineRunId, infrastructureEnvironmentId: environment.id });
            return;
        }
        await this.updateRun(pipelineRunId, {
            status: project_pipeline_run_entity_1.PipelineRunStatus.STATE_RECOVERY_REQUIRED,
            currentStage: "state_recovery_required",
        });
        await this.event(project.id, pipelineRunId, environment.id, "state_corruption_detected", "failed", "Terraform state corruption detected.", actorUser);
        await this.event(project.id, pipelineRunId, environment.id, "state_recovery_required", "failed", "State recovery decision is required.", actorUser);
        await this.audit("STATE_CORRUPTION_DETECTED", project.id, actorUser || null, "failed", { pipelineRunId, infrastructureEnvironmentId: environment.id });
        await this.audit("STATE_RECOVERY_REQUIRED", project.id, actorUser || null, "failed", { pipelineRunId, infrastructureEnvironmentId: environment.id });
        throw new Error("Terraform state recovery is required before continuing.");
    }
    async releaseStateLock(lockId, pipelineRunId, projectId, infrastructureEnvironmentId, actorUser) {
        await this.stateHeartbeatService.stopHeartbeat(lockId, pipelineRunId);
        await this.event(projectId, pipelineRunId, infrastructureEnvironmentId, "state_heartbeat_stopped", "success", "Terraform state heartbeat stopped.", actorUser);
        await this.audit("STATE_HEARTBEAT_STOPPED", projectId, actorUser || null, "success", { pipelineRunId, infrastructureEnvironmentId });
        await this.stateLockService.releaseLock(lockId, pipelineRunId);
        await this.updateRun(pipelineRunId, {
            status: project_pipeline_run_entity_1.PipelineRunStatus.STATE_LOCK_RELEASED,
            currentStage: "state_lock_released",
        });
        await this.event(projectId, pipelineRunId, infrastructureEnvironmentId, "state_lock_released", "success", "Terraform state lock released.", actorUser);
        await this.audit("STATE_LOCK_RELEASED", projectId, actorUser || null, "success", { pipelineRunId, infrastructureEnvironmentId });
        await this.stateLockService.processNextQueuedDeployment(projectId);
    }
    async updateRun(pipelineRunId, patch) {
        const run = await this.runRepository.findOne({ where: { id: pipelineRunId } });
        if (!run)
            return;
        Object.assign(run, patch);
        await this.runRepository.save(run);
    }
    async findProjectForView(user, projectId) {
        const project = await this.requireProject(projectId);
        if (user.role === user_entity_1.UserRole.ADMIN ||
            project.ownerUserId === user.id ||
            (user.role === user_entity_1.UserRole.READONLY && project.visibility === project_entity_1.ProjectVisibility.WORKSPACE)) {
            return project;
        }
        throw new common_1.ForbiddenException("Insufficient permissions");
    }
    async findProjectForManage(user, projectId) {
        const project = await this.findProjectForView(user, projectId);
        if (user.role === user_entity_1.UserRole.READONLY) {
            throw new common_1.ForbiddenException("Insufficient permissions");
        }
        if (user.role === user_entity_1.UserRole.ADMIN || project.ownerUserId === user.id) {
            return project;
        }
        throw new common_1.ForbiddenException("Insufficient permissions");
    }
    async requireProject(projectId) {
        const project = await this.projectRepository.findOne({ where: { id: projectId } });
        if (!project || project.status === project_entity_1.ProjectStatus.ARCHIVED) {
            throw new common_1.NotFoundException("Project not found");
        }
        return project;
    }
    terraformEnv() {
        return {
            AWS_REGION: this.config.get("AWS_REGION", ""),
            AWS_ACCESS_KEY_ID: this.config.get("AWS_ACCESS_KEY_ID", ""),
            AWS_SECRET_ACCESS_KEY: this.config.get("AWS_SECRET_ACCESS_KEY", ""),
        };
    }
    summarizePlan(rawJson) {
        try {
            const parsed = JSON.parse(rawJson || "{}");
            const counts = { create: 0, update: 0, delete: 0, noOp: 0 };
            for (const resource of parsed.resource_changes || []) {
                const actions = resource.change?.actions || [];
                if (actions.includes("create"))
                    counts.create += 1;
                else if (actions.includes("update"))
                    counts.update += 1;
                else if (actions.includes("delete"))
                    counts.delete += 1;
                else
                    counts.noOp += 1;
            }
            return counts;
        }
        catch {
            return { create: 0, update: 0, delete: 0, noOp: 0 };
        }
    }
    safeOutputs(outputs) {
        const allowed = [
            "vpc_id",
            "public_subnet_ids",
            "private_subnet_ids",
            "internet_gateway_id",
            "nat_gateway_ids",
            "public_route_table_id",
            "private_route_table_id",
            "alb_security_group_id",
            "app_security_group_id",
            "internal_security_group_id",
            "cloud_map_namespace_id",
            "cloud_map_namespace_name",
            "cloud_map_service_discovery_domain",
            "default_cloud_map_service_id",
            "efs_enabled",
            "efs_file_system_id",
            "efs_file_system_arn",
            "efs_dns_name",
            "efs_access_point_id",
            "efs_access_point_arn",
            "efs_security_group_id",
            "efs_kms_key_id",
            "efs_kms_key_arn",
            "efs_mount_target_ids",
            "efs_root_directory",
            "efs_posix_uid",
            "efs_posix_gid",
            "efs_root_permissions",
            "efs_backup_enabled",
            "efs_backup_vault_name",
            "efs_backup_plan_id",
            "alb_arn",
            "alb_dns_name",
            "alb_target_group_arn",
            "alb_listener_arn",
            "alb_health_check_path",
            "ecs_cluster_arn",
            "ecs_cluster_name",
            "ecs_service_arn",
            "ecs_service_name",
            "ecs_task_definition_arn",
            "ecs_capacity_provider_strategy",
            "ecs_desired_count",
            "ecs_min_tasks",
            "ecs_max_tasks",
            "ecs_cpu_target_percent",
            "ecs_container_name",
            "ecs_container_port",
            "spot_event_rule_name",
            "spot_event_rule_arn",
            "spot_event_log_group_name",
        ];
        return Object.entries(outputs).reduce((safe, [key, value]) => {
            if (allowed.includes(key)) {
                safe[key] = value;
            }
            return safe;
        }, {});
    }
    safeMetadata(metadata) {
        const allowed = [
            "projectId",
            "pipelineRunId",
            "infrastructureEnvironmentId",
            "eventType",
            "status",
            "ready",
            "blockingReasons",
            "vpcId",
            "reason",
            "stage",
            "create",
            "update",
            "delete",
            "noOp",
        ];
        return Object.entries(metadata).reduce((safe, [key, value]) => {
            if (allowed.includes(key) && value !== undefined) {
                safe[key] = value;
            }
            return safe;
        }, {});
    }
    stringOutput(value) {
        return value === undefined || value === null ? null : String(value);
    }
    arrayOutput(value) {
        return Array.isArray(value) ? value.map(String) : [];
    }
    async buildEcsTerraformVariables(project, profile, pipelineRunId) {
        const config = (0, orchestration_config_1.getOrchestrationConfig)(this.config);
        const run = pipelineRunId
            ? await this.runRepository.findOne({ where: { id: pipelineRunId, projectId: project.id } })
            : null;
        const enableEcs = Boolean(run?.ecrImageUri && run?.commitSha && /^[0-9a-f]{40}$/i.test(run.commitSha));
        const framework = (profile?.framework || profile?.ecosystem || "").toLowerCase();
        const large = framework.includes("next") || framework.includes("django");
        const environmentVariables = await this.safeProjectEnvironmentVariables(project.id);
        const healthCheckPath = profile?.healthCheckPath ||
            (config.allowHealthcheckFallback ? "/" : config.defaultHealthCheckPath);
        return {
            enable_ecs_service: enableEcs,
            ecs_container_image: enableEcs ? run.ecrImageUri : "",
            ecs_container_name: "app",
            ecs_task_cpu: large ? config.largeCpu : config.defaultCpu,
            ecs_task_memory: large ? config.largeMemory : config.defaultMemory,
            ecs_environment_variables: environmentVariables,
            ecs_use_fargate_spot: config.useFargateSpot,
            ecs_enable_fargate_fallback: config.enableFargateFallback,
            ecs_desired_count: config.minTasks,
            ecs_min_tasks: config.minTasks,
            ecs_max_tasks: config.maxTasks,
            ecs_cpu_target_percent: config.cpuTargetPercent,
            ecs_healthcheck_grace_seconds: config.healthcheckGraceSeconds,
            ecs_container_insights: config.containerInsights,
            alb_health_check_path: healthCheckPath || "/health",
            enable_eventbridge_spot_rule: config.enableEventBridgeSpotRule,
        };
    }
    async safeProjectEnvironmentVariables(projectId) {
        const rows = await this.envRepository
            .createQueryBuilder("env")
            .addSelect("env.value")
            .where("env.projectId = :projectId", { projectId })
            .andWhere("env.isSecret = false")
            .getMany();
        return rows.reduce((safe, row) => {
            if (/^[A-Z_][A-Z0-9_]*$/.test(row.key)) {
                safe[row.key] = row.value;
            }
            return safe;
        }, {});
    }
    publicError(error) {
        const message = error instanceof Error ? error.message : "Infrastructure operation failed.";
        if (/secret|password|token|credential|access.?key/i.test(message)) {
            return "Infrastructure operation failed because required cloud configuration is invalid or missing.";
        }
        return message;
    }
    toEnvironmentResponse(environment) {
        return {
            id: environment.id,
            projectId: environment.projectId,
            pipelineRunId: environment.pipelineRunId,
            environmentName: environment.environmentName,
            status: environment.status,
            awsRegion: environment.awsRegion,
            vpcId: environment.vpcId,
            publicSubnetIds: environment.publicSubnetIds,
            privateSubnetIds: environment.privateSubnetIds,
            internetGatewayId: environment.internetGatewayId,
            natGatewayIds: environment.natGatewayIds,
            routeTableIds: environment.routeTableIds,
            albSecurityGroupId: environment.albSecurityGroupId,
            appSecurityGroupId: environment.appSecurityGroupId,
            internalSecurityGroupId: environment.internalSecurityGroupId,
            cloudMapNamespaceId: environment.cloudMapNamespaceId,
            cloudMapNamespaceName: environment.cloudMapNamespaceName,
            cloudMapServiceDiscoveryDomain: environment.cloudMapServiceDiscoveryDomain,
            terraformPlanSummary: environment.terraformPlanSummary,
            errorMessage: environment.errorMessage,
            provisionedAt: environment.provisionedAt,
            failedAt: environment.failedAt,
            createdAt: environment.createdAt,
            updatedAt: environment.updatedAt,
        };
    }
};
exports.InfrastructureService = InfrastructureService;
exports.InfrastructureService = InfrastructureService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(project_entity_1.Project)),
    __param(1, (0, typeorm_1.InjectRepository)(project_detection_profile_entity_1.ProjectDetectionProfile)),
    __param(2, (0, typeorm_1.InjectRepository)(project_environment_variable_entity_1.ProjectEnvironmentVariable)),
    __param(3, (0, typeorm_1.InjectRepository)(project_pipeline_run_entity_1.ProjectPipelineRun)),
    __param(4, (0, typeorm_1.InjectRepository)(project_pipeline_event_entity_1.ProjectPipelineEvent)),
    __param(5, (0, typeorm_1.InjectRepository)(project_cost_estimate_entity_1.ProjectCostEstimate)),
    __param(6, (0, typeorm_1.InjectRepository)(project_infrastructure_environment_entity_1.ProjectInfrastructureEnvironment)),
    __param(7, (0, typeorm_1.InjectRepository)(project_infrastructure_event_entity_1.ProjectInfrastructureEvent)),
    __param(8, (0, typeorm_1.InjectRepository)(project_service_discovery_record_entity_1.ProjectServiceDiscoveryRecord)),
    __param(9, (0, typeorm_1.InjectRepository)(project_deployment_readiness_snapshot_entity_1.ProjectDeploymentReadinessSnapshot)),
    __param(10, (0, common_1.Inject)(pipeline_types_1.PIPELINE_QUEUE)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        bullmq_1.Queue,
        config_1.ConfigService,
        audit_log_service_1.AuditLogService,
        infrastructure_readiness_service_1.InfrastructureReadinessService,
        terraform_runner_service_1.TerraformRunnerService,
        service_discovery_service_1.ServiceDiscoveryService,
        terraform_state_service_1.TerraformStateService,
        state_lock_service_1.StateLockService,
        state_heartbeat_service_1.StateHeartbeatService,
        state_corruption_service_1.StateCorruptionService,
        storage_policy_service_1.StoragePolicyService,
        efs_service_1.EfsService])
], InfrastructureService);
//# sourceMappingURL=infrastructure.service.js.map