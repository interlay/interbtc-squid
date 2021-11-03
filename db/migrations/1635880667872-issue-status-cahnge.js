const { MigrationInterface, QueryRunner } = require("typeorm");

module.exports = class issueStatusCahnge1635880667872 {
    name = 'issueStatusCahnge1635880667872'

    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "issue" DROP COLUMN "status"`);
        await queryRunner.query(`ALTER TABLE "issue" ADD "status" character varying(15)`);
    }

    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "issue" DROP COLUMN "status"`);
        await queryRunner.query(`ALTER TABLE "issue" ADD "status" character varying(30)`);
    }
}
