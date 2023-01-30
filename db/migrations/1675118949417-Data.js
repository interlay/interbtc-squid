module.exports = class Data1675118949417 {
    name = 'Data1675118949417'

    async up(db) {
        await db.query(`ALTER TABLE "vault" ALTER COLUMN "pending_btc_amount" DROP NOT NULL`)
        await db.query(`ALTER TABLE "vault" ALTER COLUMN "collateralization" DROP NOT NULL`)
        await db.query(`ALTER TABLE "vault" ALTER COLUMN "status_issuing" DROP NOT NULL`)
        await db.query(`ALTER TABLE "vault" ALTER COLUMN "status_collateral" DROP NOT NULL`)
    }

    async down(db) {
        await db.query(`ALTER TABLE "vault" ALTER COLUMN "pending_btc_amount" SET NOT NULL`)
        await db.query(`ALTER TABLE "vault" ALTER COLUMN "collateralization" SET NOT NULL`)
        await db.query(`ALTER TABLE "vault" ALTER COLUMN "status_issuing" SET NOT NULL`)
        await db.query(`ALTER TABLE "vault" ALTER COLUMN "status_collateral" SET NOT NULL`)
    }
}
