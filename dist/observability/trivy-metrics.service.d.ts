import { Repository } from "typeorm";
import { ProjectSecurityFinding } from "../projects/project-security-finding.entity";
import { ProjectSecurityScan } from "../projects/project-security-scan.entity";
import { LogSanitizerService } from "./log-sanitizer.service";
import { PipelineMetricsService } from "./pipeline-metrics.service";
export declare class TrivyMetricsService {
    private readonly scanRepository;
    private readonly findingRepository;
    private readonly metrics;
    private readonly sanitizer;
    constructor(scanRepository: Repository<ProjectSecurityScan>, findingRepository: Repository<ProjectSecurityFinding>, metrics: PipelineMetricsService, sanitizer: LogSanitizerService);
    saveTrivyMetric(projectId: string, pipelineRunId: string): Promise<import("./project-stage-metric.entity").ProjectStageMetric>;
    getLatest(projectId: string, pipelineRunId?: string): Promise<ProjectSecurityScan>;
}
