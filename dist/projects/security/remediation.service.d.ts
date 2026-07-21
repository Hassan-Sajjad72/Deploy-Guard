import { ProjectDetectionProfile } from "../project-detection-profile.entity";
import { NormalizedFinding } from "./trivy-parser.service";
export declare class RemediationService {
    remediate(finding: NormalizedFinding, profile?: ProjectDetectionProfile | null): string;
    private isBaseImageFinding;
}
