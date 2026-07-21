import { ConfigService } from "@nestjs/config";
export declare class TrivyScannerService {
    private readonly config;
    constructor(config: ConfigService);
    scanImage(imageName: string): Promise<{
        scannerVersion: string;
        rawJson: string;
    }>;
    private getVersion;
    private cleanError;
}
