const { MigrationInterface, QueryRunner } = require("typeorm");

module.exports = class blocks1635441256447 {
    name = 'blocks1635441256447'

    async up(queryRunner) {
        await queryRunner.query(`CREATE TABLE "relayed_block" ("id" character varying NOT NULL, "timestamp" TIMESTAMP WITH TIME ZONE NOT NULL, "block_hash" text NOT NULL, "backing_height" integer NOT NULL, "relayer" text, "relayed_at_height_id" character varying NOT NULL, CONSTRAINT "PK_d3476accc6d016e2c8d639be260" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_12490d1e2a4b809e7d7ab0012e" ON "relayed_block" ("relayed_at_height_id") `);
        await queryRunner.query(`ALTER TABLE "relayed_block" ADD CONSTRAINT "FK_12490d1e2a4b809e7d7ab0012ef" FOREIGN KEY ("relayed_at_height_id") REFERENCES "height"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "relayed_block" DROP CONSTRAINT "FK_12490d1e2a4b809e7d7ab0012ef"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_12490d1e2a4b809e7d7ab0012e"`);
        await queryRunner.query(`DROP TABLE "relayed_block"`);
    }
}
