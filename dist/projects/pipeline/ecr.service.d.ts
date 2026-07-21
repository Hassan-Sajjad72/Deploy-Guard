import { ConfigService } from "@nestjs/config";
export declare class EcrService {
    private readonly config;
    constructor(config: ConfigService);
    hasConfig(): boolean;
    getRepositoryName(projectName: string): string;
    getImageUri(repositoryName: string, imageTag: string): string;
    ensureRepository(repositoryName: string): Promise<void>;
    loginDocker(): Promise<void>;
    applyLifecyclePolicy(repositoryName: string): Promise<void>;
    private createClient;
    private dockerLogin;
    private safeName;
}
