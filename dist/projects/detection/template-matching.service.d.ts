export type DetectionDraft = {
    hasDockerfile: boolean;
    frameworkVariant: string | null;
    ecosystem: string;
};
export declare class TemplateMatchingService {
    selectTemplate(draft: DetectionDraft): {
        selectedTemplate: string;
        dockerfileRequired: boolean;
        detectionStatus: string;
    };
}
