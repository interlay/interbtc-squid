module.exports = class Data1691727353666 {
    name = 'Data1691727353666'

    async up(db) {
        await db.query(`ALTER TABLE "swap" ADD "pool_type" character varying(8) NOT NULL`)
        await db.query(`ALTER TABLE "swap" ADD "pool_id" text NOT NULL`)
        await db.query(`ALTER TABLE "swap" ADD "event_id" text NOT NULL`)
        await db.query(`CREATE INDEX "IDX_476e1753eb0cbfad230547e79f" ON "swap" ("pool_type") `)
        await db.query(`CREATE INDEX "IDX_e78e7b899d2e3327494e5fe975" ON "swap" ("pool_id") `)
        await db.query(`CREATE INDEX "IDX_b1e1c5232ef7fe109be68524b9" ON "swap" ("to_account") `)
    }

    async down(db) {
        await db.query(`ALTER TABLE "swap" DROP COLUMN "pool_type"`)
        await db.query(`ALTER TABLE "swap" DROP COLUMN "pool_id"`)
        await db.query(`ALTER TABLE "swap" DROP COLUMN "event_id"`)
        await db.query(`DROP INDEX "public"."IDX_476e1753eb0cbfad230547e79f"`)
        await db.query(`DROP INDEX "public"."IDX_e78e7b899d2e3327494e5fe975"`)
        await db.query(`DROP INDEX "public"."IDX_b1e1c5232ef7fe109be68524b9"`)
    }
}
