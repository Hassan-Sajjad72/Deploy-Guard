import { MigrationInterface, QueryRunner } from "typeorm";
export declare class CreateProjectCostTables1760000002000 implements MigrationInterface {
    name: string;
    up(queryRunner: QueryRunner): Promise<void>;
    down(queryRunner: QueryRunner): Promise<void>;
    private addPipelineStatus;
    private addForeignKey;
}
