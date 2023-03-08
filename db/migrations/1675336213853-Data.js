module.exports = class Data1675336213853 {
    name = 'Data1675336213853'

    async up(db) {
        await db.query(`ALTER TABLE "oracle_update" ADD "update_value_human" numeric NOT NULL`)
        await db.query(`ALTER TABLE "cumulative_volume_per_currency_pair" ADD "amount_human" numeric NOT NULL`)
        await db.query(`ALTER TABLE "transfer" ADD "amount_human" numeric NOT NULL`)
    }

    async down(db) {
        await db.query(`ALTER TABLE "oracle_update" DROP COLUMN "update_value_human"`)
        await db.query(`ALTER TABLE "cumulative_volume_per_currency_pair" DROP COLUMN "amount_human"`)
        await db.query(`ALTER TABLE "transfer" DROP COLUMN "amount_human"`)
    }
}
