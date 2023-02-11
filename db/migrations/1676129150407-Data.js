module.exports = class Data1676129150407 {
    name = 'Data1676129150407'

    async up(db) {
        await db.query(`ALTER TABLE "vault" DROP COLUMN "pending_btc_amount"`)
        await db.query(`ALTER TABLE "vault" ADD "pending_wrapped_amount" numeric NOT NULL`)
        await db.query(`ALTER TABLE "vault" ADD "wrapped_amount" numeric NOT NULL`)
        await db.query(`ALTER TABLE "vault" DROP COLUMN "collateralization"`)
        await db.query(`ALTER TABLE "vault" ADD "collateralization" numeric`)
    }

    async down(db) {
        await db.query(`ALTER TABLE "vault" ADD "pending_btc_amount" numeric`)
        await db.query(`ALTER TABLE "vault" DROP COLUMN "pending_wrapped_amount"`)
        await db.query(`ALTER TABLE "vault" DROP COLUMN "wrapped_amount"`)
        await db.query(`ALTER TABLE "vault" ADD "collateralization" text`)
        await db.query(`ALTER TABLE "vault" DROP COLUMN "collateralization"`)
    }
}
