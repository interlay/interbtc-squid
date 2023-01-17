module.exports = class Data1673950446387 {
    name = 'Data1673950446387'

    async up(db) {
        await db.query(`ALTER TABLE "cumulative_volume" DROP COLUMN "type"`)
        await db.query(`ALTER TABLE "cumulative_volume" ADD "type" character varying(12) NOT NULL`)
        await db.query(`ALTER TABLE "cumulative_volume_per_currency_pair" DROP COLUMN "type"`)
        await db.query(`ALTER TABLE "cumulative_volume_per_currency_pair" ADD "type" character varying(12) NOT NULL`)
    }

    async down(db) {
        await db.query(`ALTER TABLE "cumulative_volume" ADD "type" character varying(10) NOT NULL`)
        await db.query(`ALTER TABLE "cumulative_volume" DROP COLUMN "type"`)
        await db.query(`ALTER TABLE "cumulative_volume_per_currency_pair" ADD "type" character varying(10) NOT NULL`)
        await db.query(`ALTER TABLE "cumulative_volume_per_currency_pair" DROP COLUMN "type"`)
    }
}
