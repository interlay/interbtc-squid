const { MigrationInterface, QueryRunner } = require("typeorm");

module.exports = class bridgeFeeReorg1637083608853 {
    name = 'bridgeFeeReorg1637083608853'

    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "issue" DROP COLUMN "bridge_fee"`);
        await queryRunner.query(`ALTER TABLE "issue_execution" ADD "bridge_fee_wrapped" numeric NOT NULL`);
    }

    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "issue_execution" DROP COLUMN "bridge_fee_wrapped"`);
        await queryRunner.query(`ALTER TABLE "issue" ADD "bridge_fee" numeric NOT NULL`);
    }
}
