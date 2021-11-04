const { MigrationInterface, QueryRunner } = require("typeorm");

module.exports = class redeemTweaks1636030896339 {
    name = 'redeemTweaks1636030896339'

    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "redeem_cancellation" ADD "slashed_collateral" numeric NOT NULL`);
        await queryRunner.query(`ALTER TABLE "height" DROP COLUMN "absolute"`);
        await queryRunner.query(`ALTER TABLE "height" ADD "absolute" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "redeem" DROP COLUMN "status"`);
        await queryRunner.query(`ALTER TABLE "redeem" ADD "status" character varying(10)`);
    }

    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "redeem" DROP COLUMN "status"`);
        await queryRunner.query(`ALTER TABLE "redeem" ADD "status" character varying(30)`);
        await queryRunner.query(`ALTER TABLE "height" DROP COLUMN "absolute"`);
        await queryRunner.query(`ALTER TABLE "height" ADD "absolute" numeric NOT NULL`);
        await queryRunner.query(`ALTER TABLE "redeem_cancellation" DROP COLUMN "slashed_collateral"`);
    }
}
