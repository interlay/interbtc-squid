module.exports = class Data1678203850076 {
    name = 'Data1678203850076'

    async up(db) {
        await db.query(`ALTER TABLE "vault" DROP COLUMN "status_collateral"`)
        await db.query(`ALTER TABLE "vault" ADD "status_collateral" character varying(27) NOT NULL`)
    }

    async down(db) {
        await db.query(`ALTER TABLE "vault" ADD "status_collateral" character varying(16) NOT NULL`)
        await db.query(`ALTER TABLE "vault" DROP COLUMN "status_collateral"`)
    }
}
