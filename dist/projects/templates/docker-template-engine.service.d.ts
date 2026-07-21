import { ProjectDetectionProfile } from "../project-detection-profile.entity";
import { DevOpsTemplateDefinition } from "./devops-templates";
export declare class DockerTemplateEngineService {
    renderDockerfile(template: DevOpsTemplateDefinition, profile: ProjectDetectionProfile): string | null;
    private installCommand;
    private defaultBuildCommand;
    private defaultStartCommand;
    private appEntry;
}
