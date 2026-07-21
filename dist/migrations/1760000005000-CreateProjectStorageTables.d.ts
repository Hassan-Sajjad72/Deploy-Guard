import { MigrationInterface, QueryRunner } from "typeorm";
export declare class CreateProjectStorageTables1760000005000 implements MigrationInterface {
    name: string;
    up(queryRunner: QueryRunner): Promise<void>;
    down(queryRunner: QueryRunner): Promise<void>;
    private addPipelineRunStatus;
    private addForeignKey;
}
