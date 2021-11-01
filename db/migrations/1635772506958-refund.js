const { MigrationInterface, QueryRunner } = require("typeorm");

module.exports = class refund1635772506958 {
    name = 'refund1635772506958'

    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "issue_execution" RENAME COLUMN "executed_amount_wrapped" TO "amount_wrapped"`);
        await queryRunner.query(`ALTER TABLE "refund" DROP COLUMN "refund_btc_address"`);
        await queryRunner.query(`ALTER TABLE "refund" DROP COLUMN "refund_amount_btc"`);
        await queryRunner.query(`ALTER TABLE "refund" ADD "btc_address" text NOT NULL`);
        await queryRunner.query(`ALTER TABLE "refund" ADD "amount_paid" numeric NOT NULL`);
        await queryRunner.query(`ALTER TABLE "refund" ADD "btc_fee" numeric NOT NULL`);
        await queryRunner.query(`ALTER TABLE "refund" ADD "request_timestamp" TIMESTAMP WITH TIME ZONE NOT NULL`);
        await queryRunner.query(`ALTER TABLE "refund" ADD "execution_timestamp" TIMESTAMP WITH TIME ZONE`);
        await queryRunner.query(`ALTER TABLE "refund" ADD "request_height_id" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "refund" ADD "execution_height_id" character varying`);
        await queryRunner.query(`CREATE INDEX "IDX_6f89ed2dbc4f9c865225bf2158" ON "refund" ("request_height_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_f0f30338e4f262c6f988bb0480" ON "refund" ("execution_height_id") `);
        await queryRunner.query(`ALTER TABLE "refund" ADD CONSTRAINT "FK_6f89ed2dbc4f9c865225bf2158c" FOREIGN KEY ("request_height_id") REFERENCES "height"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "refund" ADD CONSTRAINT "FK_f0f30338e4f262c6f988bb04806" FOREIGN KEY ("execution_height_id") REFERENCES "height"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "refund" DROP CONSTRAINT "FK_f0f30338e4f262c6f988bb04806"`);
        await queryRunner.query(`ALTER TABLE "refund" DROP CONSTRAINT "FK_6f89ed2dbc4f9c865225bf2158c"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_f0f30338e4f262c6f988bb0480"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_6f89ed2dbc4f9c865225bf2158"`);
        await queryRunner.query(`ALTER TABLE "refund" DROP COLUMN "execution_height_id"`);
        await queryRunner.query(`ALTER TABLE "refund" DROP COLUMN "request_height_id"`);
        await queryRunner.query(`ALTER TABLE "refund" DROP COLUMN "execution_timestamp"`);
        await queryRunner.query(`ALTER TABLE "refund" DROP COLUMN "request_timestamp"`);
        await queryRunner.query(`ALTER TABLE "refund" DROP COLUMN "btc_fee"`);
        await queryRunner.query(`ALTER TABLE "refund" DROP COLUMN "amount_paid"`);
        await queryRunner.query(`ALTER TABLE "refund" DROP COLUMN "btc_address"`);
        await queryRunner.query(`ALTER TABLE "refund" ADD "refund_amount_btc" numeric`);
        await queryRunner.query(`ALTER TABLE "refund" ADD "refund_btc_address" text NOT NULL`);
        await queryRunner.query(`ALTER TABLE "issue_execution" RENAME COLUMN "amount_wrapped" TO "executed_amount_wrapped"`);
    }
}
