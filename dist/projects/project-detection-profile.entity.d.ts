import { Project } from "./project.entity";
export declare enum DetectionStatus {
    SUCCESS = "success",
    NEEDS_MANUAL_DOCKERFILE = "needs_manual_dockerfile",
    FAILED = "failed"
}
export declare enum DetectionConfidence {
    HIGH = "high",
    MEDIUM = "medium",
    LOW = "low"
}
export declare class ProjectDetectionProfile {
    id: string;
    projectId: string;
    project: Project;
    repositoryUrl: string;
    repositoryFullName: string;
    targetBranch: string;
    commitSha: string;
    ecosystem: string;
    language: string;
    framework: string;
    frameworkVariant: string;
    packageManager: string;
    runtimeVersion: string;
    buildCommand: string;
    startCommand: string;
    expectedPort: number;
    healthCheckPath: string;
    requiresDatabase: boolean;
    databaseType: string;
    requiresPersistentStorage: boolean;
    staticOutput: boolean;
    dockerfileRequired: boolean;
    hasDockerfile: boolean;
    selectedTemplate: string;
    confidence: string;
    detectionStatus: string;
    warnings: string[] | null;
    errors: string[] | null;
    rawProfile: Record<string, unknown> | null;
    createdAt: Date;
    updatedAt: Date;
}
