import { Project } from "./project.entity";
export declare class ProjectEnvironmentVariable {
    id: string;
    projectId: string;
    project: Project;
    key: string;
    value: string;
    isSecret: boolean;
    createdAt: Date;
    updatedAt: Date;
}
