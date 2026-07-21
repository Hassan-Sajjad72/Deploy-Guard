import { MigrationInterface, QueryRunner } from "typeorm";
export declare class CreateProjectObservabilityTables1760000007000 implements MigrationInterface {
    name: string;
    up(queryRunner: QueryRunner): Promise<void>;
    down(queryRunner: QueryRunner): Promise<void>;
    private addForeignKey;
}
