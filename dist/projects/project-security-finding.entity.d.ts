import { ProjectPipelineRun } from "./project-pipeline-run.entity";
import { ProjectSecurityScan } from "./project-security-scan.entity";
import { Project } from "./project.entity";
export declare enum SecurityFindingSeverity {
    CRITICAL = "CRITICAL",
    HIGH = "HIGH",
    MEDIUM = "MEDIUM",
    LOW = "LOW",
    UNKNOWN = "UNKNOWN"
}
export declare class ProjectSecurityFinding {
    id: string;
    scanId: string;
    scan: ProjectSecurityScan;
    projectId: string;
    project: Project;
    pipelineRunId: string;
    pipelineRun: ProjectPipelineRun;
    vulnerabilityId: string;
    severity: string;
    packageName: string;
    installedVersion: string;
    fixedVersion: string;
    target: string;
    type: string;
    title: string;
    description: string;
    primaryUrl: string;
    remediation: string;
    createdAt: Date;
}
