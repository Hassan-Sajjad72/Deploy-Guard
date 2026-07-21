import { OnModuleDestroy } from "@nestjs/common";
import { Repository } from "typeorm";
import { ProjectTerraformLock } from "./project-terraform-lock.entity";
export declare class StateHeartbeatService implements OnModuleDestroy {
    private readonly lockRepository;
    private readonly timers;
    constructor(lockRepository: Repository<ProjectTerraformLock>);
    startHeartbeat(lockId: string, pipelineRunId: string): Promise<void>;
    updateHeartbeat(lockId: string, pipelineRunId: string): Promise<ProjectTerraformLock>;
    stopHeartbeat(lockId: string, pipelineRunId: string): Promise<ProjectTerraformLock>;
    onModuleDestroy(): Promise<void>;
}
