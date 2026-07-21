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
exports.TerraformStateService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const crypto_1 = require("crypto");
const promises_1 = require("fs/promises");
const path_1 = require("path");
const typeorm_2 = require("typeorm");
const aws_cli_service_1 = require("./aws-cli.service");
const project_terraform_state_entity_1 = require("./project-terraform-state.entity");
const state_management_config_1 = require("./state-management.config");
let TerraformStateService = class TerraformStateService {
    constructor(stateRepository, config, awsCli) {
        this.stateRepository = stateRepository;
        this.config = config;
        this.awsCli = awsCli;
    }
    async ensureStateBucket() {
        const stateConfig = (0, state_management_config_1.getStateManagementConfig)(this.config);
        if (!stateConfig.bucket) {
            if (stateConfig.mockMode) {
                return;
            }
            throw new Error("DEPLOYGUARD_TF_STATE_BUCKET is required for remote Terraform state.");
        }
        await this.awsCli.run(["s3api", "head-bucket", "--bucket", stateConfig.bucket]);
    }
    async ensureStateBucketVersioning() {
        const stateConfig = (0, state_management_config_1.getStateManagementConfig)(this.config);
        await this.awsCli.run([
            "s3api",
            "put-bucket-versioning",
            "--bucket",
            stateConfig.bucket,
            "--versioning-configuration",
            "Status=Enabled",
        ]);
    }
    async ensureStateBucketEncryption() {
        const stateConfig = (0, state_management_config_1.getStateManagementConfig)(this.config);
        await this.awsCli.run([
            "s3api",
            "put-bucket-encryption",
            "--bucket",
            stateConfig.bucket,
            "--server-side-encryption-configuration",
            JSON.stringify({
                Rules: [{ ApplyServerSideEncryptionByDefault: { SSEAlgorithm: "AES256" } }],
            }),
        ]);
    }
    async ensureStateBucketPublicAccessBlock() {
        const stateConfig = (0, state_management_config_1.getStateManagementConfig)(this.config);
        await this.awsCli.run([
            "s3api",
            "put-public-access-block",
            "--bucket",
            stateConfig.bucket,
            "--public-access-block-configuration",
            "BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true",
        ]);
    }
    async ensureLockTable() {
        const stateConfig = (0, state_management_config_1.getStateManagementConfig)(this.config);
        await this.awsCli.run([
            "dynamodb",
            "describe-table",
            "--table-name",
            stateConfig.lockTable,
        ]);
    }
    buildStateKey(project, environmentName = "dev") {
        const stateConfig = (0, state_management_config_1.getStateManagementConfig)(this.config);
        const owner = project.ownerUserId || "unknown";
        const prefix = stateConfig.prefix.replace(/^\/+|\/+$/g, "");
        return `${prefix}/user-${owner}/project-${project.id}/${environmentName}/terraform.tfstate`;
    }
    generateTerraformBackendConfig(project, environmentName = "dev") {
        const stateConfig = (0, state_management_config_1.getStateManagementConfig)(this.config);
        const key = this.buildStateKey(project, environmentName);
        return [
            `bucket = "${stateConfig.bucket}"`,
            `key = "${key}"`,
            `region = "${stateConfig.region}"`,
            `dynamodb_table = "${stateConfig.lockTable}"`,
            "encrypt = true",
        ].join("\n");
    }
    async writeBackendConfig(workdir, project, environmentName = "dev") {
        const backendConfig = this.generateTerraformBackendConfig(project, environmentName);
        const path = (0, path_1.join)(workdir, "backend.hcl");
        await (0, promises_1.writeFile)(path, backendConfig, "utf8");
        return path;
    }
    async listStateVersions(project, environmentName = "dev") {
        const stateConfig = (0, state_management_config_1.getStateManagementConfig)(this.config);
        const key = this.buildStateKey(project, environmentName);
        const result = await this.awsCli.run([
            "s3api",
            "list-object-versions",
            "--bucket",
            stateConfig.bucket,
            "--prefix",
            key,
        ]);
        try {
            const parsed = JSON.parse(result.stdout || "{}");
            return parsed.Versions || [];
        }
        catch {
            return [];
        }
    }
    async getStateObject(project, environmentName = "dev") {
        const stateConfig = (0, state_management_config_1.getStateManagementConfig)(this.config);
        const key = this.buildStateKey(project, environmentName);
        const result = await this.awsCli.run([
            "s3api",
            "get-object",
            "--bucket",
            stateConfig.bucket,
            "--key",
            key,
            "/dev/stdout",
        ]);
        return result.stdout;
    }
    async getPreviousStateVersion(project, environmentName = "dev") {
        const versions = await this.listStateVersions(project, environmentName);
        return versions[1] || null;
    }
    async restoreStateVersion(project, environmentName, versionId) {
        const stateConfig = (0, state_management_config_1.getStateManagementConfig)(this.config);
        const key = this.buildStateKey(project, environmentName);
        await this.awsCli.run([
            "s3api",
            "copy-object",
            "--bucket",
            stateConfig.bucket,
            "--copy-source",
            `${stateConfig.bucket}/${key}?versionId=${encodeURIComponent(versionId)}`,
            "--key",
            key,
        ]);
    }
    async upsertStateMetadata(input) {
        const stateConfig = (0, state_management_config_1.getStateManagementConfig)(this.config);
        const environmentName = input.environmentName || "dev";
        const stateKey = this.buildStateKey(input.project, environmentName);
        const existing = await this.stateRepository.findOne({
            where: { projectId: input.project.id, environmentName },
        });
        const state = existing || this.stateRepository.create({ projectId: input.project.id, environmentName });
        state.infrastructureEnvironmentId = input.environment?.id || state.infrastructureEnvironmentId || null;
        state.stateBucket = stateConfig.bucket || "mock-state-bucket";
        state.stateKey = stateKey;
        state.stateRegion = stateConfig.region;
        state.previousVersionId = state.currentVersionId || null;
        state.currentVersionId = input.versionId || state.currentVersionId || null;
        state.checksum = input.rawState ? this.sha256(input.rawState) : state.checksum || null;
        state.resourceCount = input.resourceCount ?? state.resourceCount ?? null;
        state.dependencyGraphHash = input.dependencyGraphHash || state.dependencyGraphHash || null;
        state.status = input.status || project_terraform_state_entity_1.TerraformStateStatus.ACTIVE;
        state.lastValidatedAt = new Date();
        return this.stateRepository.save(state);
    }
    async getStateMetadata(projectId, environmentName = "dev") {
        return this.stateRepository.findOne({ where: { projectId, environmentName } });
    }
    sha256(value) {
        return (0, crypto_1.createHash)("sha256").update(value).digest("hex");
    }
};
exports.TerraformStateService = TerraformStateService;
exports.TerraformStateService = TerraformStateService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(project_terraform_state_entity_1.ProjectTerraformState)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        config_1.ConfigService,
        aws_cli_service_1.AwsCliService])
], TerraformStateService);
//# sourceMappingURL=terraform-state.service.js.map