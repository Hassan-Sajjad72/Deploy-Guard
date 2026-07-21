import { User } from "../users/user.entity";
import { ProjectDeployment } from "./project-deployment.entity";
export declare class ProjectOrchestrationEvent {
    id: string;
    projectId: string;
    pipelineRunId: string;
    deploymentId: string;
    deployment: ProjectDeployment;
    eventType: string;
    status: string;
    message: string;
    metadata: Record<string, unknown> | null;
    actorUserId: number;
    actorUser: User;
    createdAt: Date;
}
