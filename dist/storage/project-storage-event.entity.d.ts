import { User } from "../users/user.entity";
import { ProjectPersistentStorage } from "./project-persistent-storage.entity";
export declare class ProjectStorageEvent {
    id: string;
    projectId: string;
    pipelineRunId: string;
    persistentStorageId: string;
    persistentStorage: ProjectPersistentStorage;
    eventType: string;
    status: string;
    message: string;
    metadata: Record<string, unknown> | null;
    actorUserId: number;
    actorUser: User;
    createdAt: Date;
}
