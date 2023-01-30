module.exports = class Data1675118472351 {
    name = 'Data1675118472351'

    async up(db) {
        await db.query(`ALTER TABLE "vault" ADD "collateral_amount" numeric NOT NULL`)
        await db.query(`ALTER TABLE "vault" ADD "pending_btc_amount" numeric NOT NULL`)
        await db.query(`ALTER TABLE "vault" ADD "collateralization" text NOT NULL`)
        await db.query(`ALTER TABLE "vault" ADD "status_issuing" boolean NOT NULL`)
        await db.query(`ALTER TABLE "vault" ADD "status_collateral" boolean NOT NULL`)
    }

    async down(db) {
        await db.query(`ALTER TABLE "vault" DROP COLUMN "collateral_amount"`)
        await db.query(`ALTER TABLE "vault" DROP COLUMN "pending_btc_amount"`)
        await db.query(`ALTER TABLE "vault" DROP COLUMN "collateralization"`)
        await db.query(`ALTER TABLE "vault" DROP COLUMN "status_issuing"`)
        await db.query(`ALTER TABLE "vault" DROP COLUMN "status_collateral"`)
    }
}
