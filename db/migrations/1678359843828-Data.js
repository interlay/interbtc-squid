module.exports = class Data1678359843828 {
    name = 'Data1678359843828'

    async up(db) {
        await db.query(`CREATE TABLE "cumulative_dex_trading_volume_per_pool" ("id" character varying NOT NULL, "pool_id" text NOT NULL, "pool_type" character varying(8) NOT NULL, "till_timestamp" TIMESTAMP WITH TIME ZONE NOT NULL, "amounts" jsonb NOT NULL, CONSTRAINT "PK_c9bb1ee57bff1390d948e3e6f12" PRIMARY KEY ("id"))`)
        await db.query(`CREATE INDEX "IDX_bd6bc9a6ce9e1fcb81b0650c0f" ON "cumulative_dex_trading_volume_per_pool" ("pool_id") `)
        await db.query(`CREATE INDEX "IDX_a903319c2555960f188406a839" ON "cumulative_dex_trading_volume_per_pool" ("till_timestamp") `)
    }

    async down(db) {
        await db.query(`DROP TABLE "cumulative_dex_trading_volume_per_pool"`)
        await db.query(`DROP INDEX "public"."IDX_bd6bc9a6ce9e1fcb81b0650c0f"`)
        await db.query(`DROP INDEX "public"."IDX_a903319c2555960f188406a839"`)
    }
}
