import { MigrationInterface, QueryRunner } from "typeorm";
export declare class CreateProjectOrchestrationTables1760000006000 implements MigrationInterface {
    name: string;
    up(queryRunner: QueryRunner): Promise<void>;
    down(queryRunner: QueryRunner): Promise<void>;
    private addPipelineRunStatus;
    private addForeignKey;
}
