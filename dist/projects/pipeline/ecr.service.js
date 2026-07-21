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
exports.EcrService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const client_ecr_1 = require("@aws-sdk/client-ecr");
const child_process_1 = require("child_process");
const LIFECYCLE_POLICY = {
    rules: [
        {
            rulePriority: 1,
            description: "Expire untagged images older than 30 days",
            selection: {
                tagStatus: "untagged",
                countType: "sinceImagePushed",
                countUnit: "days",
                countNumber: 30,
            },
            action: {
                type: "expire",
            },
        },
    ],
};
let EcrService = class EcrService {
    constructor(config) {
        this.config = config;
    }
    hasConfig() {
        return Boolean(this.config.get("AWS_REGION") &&
            this.config.get("AWS_ACCOUNT_ID") &&
            this.config.get("AWS_ACCESS_KEY_ID") &&
            this.config.get("AWS_SECRET_ACCESS_KEY"));
    }
    getRepositoryName(projectName) {
        const prefix = this.config.get("ECR_REPOSITORY_PREFIX", "mini-paas");
        return `${this.safeName(prefix)}-${this.safeName(projectName)}`;
    }
    getImageUri(repositoryName, imageTag) {
        const accountId = this.config.get("AWS_ACCOUNT_ID");
        const region = this.config.get("AWS_REGION", "us-east-1");
        return `${accountId}.dkr.ecr.${region}.amazonaws.com/${repositoryName}:${imageTag}`;
    }
    async ensureRepository(repositoryName) {
        const client = this.createClient();
        try {
            await client.send(new client_ecr_1.DescribeRepositoriesCommand({ repositoryNames: [repositoryName] }));
        }
        catch {
            await client.send(new client_ecr_1.CreateRepositoryCommand({ repositoryName }));
        }
    }
    async loginDocker() {
        const client = this.createClient();
        const response = await client.send(new client_ecr_1.GetAuthorizationTokenCommand({}));
        const auth = response.authorizationData?.[0];
        if (!auth?.authorizationToken || !auth.proxyEndpoint) {
            throw new Error("Unable to obtain ECR authorization token");
        }
        const decoded = Buffer.from(auth.authorizationToken, "base64").toString("utf8");
        const [username, password] = decoded.split(":");
        if (!username || !password) {
            throw new Error("Invalid ECR authorization token");
        }
        await this.dockerLogin(auth.proxyEndpoint, username, password);
    }
    async applyLifecyclePolicy(repositoryName) {
        const client = this.createClient();
        await client.send(new client_ecr_1.PutLifecyclePolicyCommand({
            repositoryName,
            lifecyclePolicyText: JSON.stringify(LIFECYCLE_POLICY),
        }));
    }
    createClient() {
        return new client_ecr_1.ECRClient({
            region: this.config.get("AWS_REGION", "us-east-1"),
            credentials: {
                accessKeyId: this.config.get("AWS_ACCESS_KEY_ID", ""),
                secretAccessKey: this.config.get("AWS_SECRET_ACCESS_KEY", ""),
            },
        });
    }
    dockerLogin(registry, username, password) {
        return new Promise((resolve, reject) => {
            const child = (0, child_process_1.spawn)("docker", ["login", "--username", username, "--password-stdin", registry], {
                stdio: ["pipe", "ignore", "pipe"],
            });
            let stderr = "";
            child.stderr.on("data", (chunk) => {
                stderr += chunk.toString();
            });
            child.on("error", reject);
            child.on("close", (code) => {
                if (code === 0) {
                    resolve();
                }
                else {
                    reject(new Error(stderr || "Docker login to ECR failed"));
                }
            });
            child.stdin.write(password);
            child.stdin.end();
        });
    }
    safeName(value) {
        return value
            .toLowerCase()
            .replace(/[^a-z0-9-]+/g, "-")
            .replace(/^-+|-+$/g, "")
            .slice(0, 80);
    }
};
exports.EcrService = EcrService;
exports.EcrService = EcrService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], EcrService);
//# sourceMappingURL=ecr.service.js.map