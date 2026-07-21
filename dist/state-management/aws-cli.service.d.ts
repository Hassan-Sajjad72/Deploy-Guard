import { ConfigService } from "@nestjs/config";
export declare class AwsCliService {
    private readonly config;
    constructor(config: ConfigService);
    run(args: string[]): Promise<{
        stdout: string;
        stderr: string;
    }>;
    sanitize(value: string): string;
}
