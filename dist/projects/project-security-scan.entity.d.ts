import { User } from "../users/user.entity";
import { ProjectPipelineRun } from "./project-pipeline-run.entity";
import { Project } from "./project.entity";
import { ProjectSecurityFinding } from "./project-security-finding.entity";
export declare enum SecurityScanStatus {
    QUEUED = "queued",
    RUNNING = "running",
    COMPLETED = "completed",
    FAILED = "failed"
}
export declare enum SecurityPolicyDecision {
    ALLOWED = "allowed",
    BLOCKED = "blocked",
    REQUIRES_APPROVAL = "requires_approval",
    APPROVED_OVERRIDE = "approved_override"
}
export declare class ProjectSecurityScan {
    id: string;
    projectId: string;
    project: Project;
    pipelineRunId: string;
    pipelineRun: ProjectPipelineRun;
    imageName: string;
    imageTag: string;
    imageUri: string;
    scanner: string;
    scannerVersion: string;
    scanStatus: string;
    startedAt: Date;
    completedAt: Date;
    failedAt: Date;
    totalVulnerabilities: number;
    criticalCount: number;
    highCount: number;
    mediumCount: number;
    lowCount: number;
    unknownCount: number;
    policyDecision: string;
    policyReason: string;
    manualApprovalRequired: boolean;
    approvedByUserId: number;
    approvedByUser: User;
    approvedAt: Date;
    approvalReason: string;
    rawSummary: Record<string, unknown> | null;
    findings: ProjectSecurityFinding[];
    createdAt: Date;
    updatedAt: Date;
}
