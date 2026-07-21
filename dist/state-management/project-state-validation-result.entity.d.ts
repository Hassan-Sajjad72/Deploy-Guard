export declare enum StateValidationStatus {
    VALID = "valid",
    CORRUPTED = "corrupted",
    WARNING = "warning",
    FAILED = "failed"
}
export declare class ProjectStateValidationResult {
    id: string;
    projectId: string;
    infrastructureEnvironmentId: string;
    environmentName: string;
    stateVersionId: string;
    status: string;
    jsonSchemaValid: boolean;
    checksumValid: boolean;
    resourceCountValid: boolean;
    dependencyGraphValid: boolean;
    resourceCount: number;
    expectedChecksum: string;
    actualChecksum: string;
    issues: string[] | null;
    createdAt: Date;
}
