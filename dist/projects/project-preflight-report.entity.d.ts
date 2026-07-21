import { ProjectDetectionProfile } from "./project-detection-profile.entity";
import { Project } from "./project.entity";
export declare enum PreflightValidationStatus {
    PASSED = "passed",
    PASSED_WITH_WARNINGS = "passed_with_warnings",
    FAILED = "failed",
    MANUAL_DOCKERFILE_REQUIRED = "manual_dockerfile_required"
}
export declare class ProjectPreflightReport {
    id: string;
    projectId: string;
    project: Project;
    detectionProfileId: string;
    detectionProfile: ProjectDetectionProfile;
    templateKey: string;
    templateDisplayName: string;
    ecosystem: string;
    framework: string;
    frameworkVariant: string;
    packageManager: string;
    runtimeVersion: string;
    expectedPort: number;
    buildCommand: string;
    startCommand: string;
    healthCheckPath: string;
    hasDockerfile: boolean;
    dockerfileRequired: boolean;
    generatedDockerfile: string;
    report: Record<string, unknown>;
    validationStatus: string;
    warnings: string[] | null;
    errors: string[] | null;
    createdAt: Date;
    updatedAt: Date;
}
