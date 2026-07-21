import { User } from "../users/user.entity";
import { ProjectEnvironmentVariable } from "./project-environment-variable.entity";
export declare enum ProjectStatus {
    CREATED = "created",
    CONFIGURED = "configured",
    ARCHIVED = "archived"
}
export declare enum ProjectVisibility {
    PRIVATE = "private",
    WORKSPACE = "workspace"
}
export declare class Project {
    id: string;
    ownerUserId: number;
    owner: User;
    name: string;
    description: string;
    repositoryUrl: string;
    repositoryProvider: string;
    repositoryFullName: string;
    targetBranch: string;
    status: ProjectStatus;
    visibility: ProjectVisibility;
    environmentVariables: ProjectEnvironmentVariable[];
    createdAt: Date;
    updatedAt: Date;
    archivedAt: Date;
}
