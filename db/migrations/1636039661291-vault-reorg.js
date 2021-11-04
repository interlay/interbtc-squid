const { MigrationInterface, QueryRunner } = require("typeorm");

module.exports = class vaultReorg1636039661291 {
    name = 'vaultReorg1636039661291'

    async up(queryRunner) {
        await queryRunner.query(`CREATE TABLE "vault" ("id" character varying NOT NULL, "registration_block" integer NOT NULL, "registration_timestamp" TIMESTAMP WITH TIME ZONE NOT NULL, "last_activity_id" character varying, CONSTRAINT "PK_dd0898234c77f9d97585171ac59" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_ca61dd10e3a7f0aa434c56525b" ON "vault" ("last_activity_id") `);
        await queryRunner.query(`ALTER TABLE "vault" ADD CONSTRAINT "FK_ca61dd10e3a7f0aa434c56525b0" FOREIGN KEY ("last_activity_id") REFERENCES "height"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "vault" DROP CONSTRAINT "FK_ca61dd10e3a7f0aa434c56525b0"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_ca61dd10e3a7f0aa434c56525b"`);
        await queryRunner.query(`DROP TABLE "vault"`);
    }
}
