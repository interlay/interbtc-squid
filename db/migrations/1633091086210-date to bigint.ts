import {MigrationInterface, QueryRunner} from "typeorm";

export class dateToBigint1633091086210 implements MigrationInterface {
    name = 'dateToBigint1633091086210'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "public"."issue" DROP COLUMN "creation_timestamp"`);
        await queryRunner.query(`ALTER TABLE "public"."issue" ADD "creation_timestamp" numeric NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "public"."issue" DROP COLUMN "creation_timestamp"`);
        await queryRunner.query(`ALTER TABLE "public"."issue" ADD "creation_timestamp" integer NOT NULL`);
    }

}
