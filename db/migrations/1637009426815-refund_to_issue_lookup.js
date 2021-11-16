const { MigrationInterface, QueryRunner } = require("typeorm");

module.exports = class refundToIssueLookup1637009426815 {
    name = 'refundToIssueLookup1637009426815'

    async up(queryRunner) {
        await queryRunner.query(`CREATE TABLE "oracle_update" ("id" character varying NOT NULL, "timestamp" TIMESTAMP WITH TIME ZONE NOT NULL, "oracle_id" text NOT NULL, "type" character varying(13) NOT NULL, "type_key" text, "update_value" text NOT NULL, "height_id" character varying NOT NULL, CONSTRAINT "PK_198859007c7a88cb0b1e6f9234f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_b98c119d788456a5f133024aa5" ON "oracle_update" ("height_id") `);
        await queryRunner.query(`ALTER TABLE "oracle_update" ADD CONSTRAINT "FK_b98c119d788456a5f133024aa57" FOREIGN KEY ("height_id") REFERENCES "height"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "oracle_update" DROP CONSTRAINT "FK_b98c119d788456a5f133024aa57"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_b98c119d788456a5f133024aa5"`);
        await queryRunner.query(`DROP TABLE "oracle_update"`);
    }
}
