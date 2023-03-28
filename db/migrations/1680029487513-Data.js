module.exports = class Data1680029487513 {
    name = 'Data1680029487513'

    async up(db) {
        await db.query(`ALTER TABLE "loan_liquidation" DROP COLUMN "liquidation_cost"`)
        await db.query(`ALTER TABLE "loan_liquidation" DROP COLUMN "liquidation_cost_token"`)
        await db.query(`ALTER TABLE "loan_liquidation" ADD "liquidation_cost_btc" numeric NOT NULL`)
        await db.query(`ALTER TABLE "loan_liquidation" ADD "liquidation_cost_usdt" numeric NOT NULL`)
    }

    async down(db) {
        await db.query(`ALTER TABLE "loan_liquidation" ADD "liquidation_cost" numeric NOT NULL`)
        await db.query(`ALTER TABLE "loan_liquidation" ADD "liquidation_cost_token" jsonb NOT NULL`)
        await db.query(`ALTER TABLE "loan_liquidation" DROP COLUMN "liquidation_cost_btc"`)
        await db.query(`ALTER TABLE "loan_liquidation" DROP COLUMN "liquidation_cost_usdt"`)
    }
}
