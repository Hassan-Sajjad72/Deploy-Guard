import { ConfigService } from "@nestjs/config";
export declare function createRedisConnection(config: ConfigService): {
    host: string;
    port: number;
    password: string;
    tls: {};
    maxRetriesPerRequest: any;
};
