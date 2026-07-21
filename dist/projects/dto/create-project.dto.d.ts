import { ProjectVisibility } from "../project.entity";
export declare class CreateProjectDto {
    name: string;
    description?: string;
    repositoryUrl: string;
    targetBranch?: string;
    visibility?: ProjectVisibility;
}
