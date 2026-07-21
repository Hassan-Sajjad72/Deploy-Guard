import { Response } from "express";
import { User } from "../users/user.entity";
import { CloudWatchLogsService, LogQueryOptions } from "./cloudwatch-logs.service";
export declare class SseLogStreamService {
    private readonly cloudWatchLogs;
    constructor(cloudWatchLogs: CloudWatchLogsService);
    stream(projectId: string, options: LogQueryOptions, response: Response, actorUser?: User | null): Promise<void>;
}
