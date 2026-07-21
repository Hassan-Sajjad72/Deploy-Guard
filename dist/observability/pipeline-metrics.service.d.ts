import { Repository } from "typeorm";
import { ProjectOrchestrationEvent } from "../orchestration/project-orchestration-event.entity";
import { ProjectPipelineEvent } from "../projects/project-pipeline-event.entity";
import { ProjectPipelineRun } from "../projects/project-pipeline-run.entity";
import { LogSanitizerService } from "./log-sanitizer.service";
import { ProjectPipelineMetricSummary } from "./project-pipeline-metric-summary.entity";
import { ProjectStageMetric, StageMetricSource } from "./project-stage-metric.entity";
export declare class PipelineMetricsService {
    private readonly metricRepository;
    private readonly summaryRepository;
    private readonly runRepository;
    private readonly eventRepository;
    private readonly orchestrationEventRepository;
    private readonly sanitizer;
    constructor(metricRepository: Repository<ProjectStageMetric>, summaryRepository: Repository<ProjectPipelineMetricSummary>, runRepository: Repository<ProjectPipelineRun>, eventRepository: Repository<ProjectPipelineEvent>, orchestrationEventRepository: Repository<ProjectOrchestrationEvent>, sanitizer: LogSanitizerService);
    startStage(projectId: string, pipelineRunId: string, stageName: string, source: StageMetricSource | string, metadata?: Record<string, unknown>): Promise<ProjectStageMetric>;
    completeStage(projectId: string, pipelineRunId: string, stageName: string, metadata?: Record<string, unknown>): Promise<ProjectStageMetric>;
    failStage(projectId: string, pipelineRunId: string, stageName: string, error: unknown, metadata?: Record<string, unknown>): Promise<ProjectStageMetric>;
    skipStage(projectId: string, pipelineRunId: string, stageName: string, reason?: string): Promise<ProjectStageMetric>;
    getPipelineMetrics(projectId: string, pipelineRunId: string): Promise<{
        stageMetrics: ProjectStageMetric[];
        summary: ProjectPipelineMetricSummary;
    }>;
    getLatestPipelineSummary(projectId: string): Promise<ProjectPipelineMetricSummary>;
    buildPipelineSummary(projectId: string, pipelineRunId: string): Promise<ProjectPipelineMetricSummary>;
    private finishStage;
    private buildStageMetricsFromEvents;
    private fromEvents;
    private stageDuration;
    private duration;
}
