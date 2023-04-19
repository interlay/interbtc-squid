module.exports = class Data1681914441657 {
    name = 'Data1681914441657'

    async up(db) {
        await db.query(`CREATE TABLE "dex_fee_rate" ("id" character varying NOT NULL, "pool_id" text NOT NULL, "pool_type" character varying(8) NOT NULL, "timestamp" TIMESTAMP WITH TIME ZONE NOT NULL, "fee_rate" numeric NOT NULL, "admin_fee_rate" numeric, CONSTRAINT "PK_26194937472d73b61f357bb75b1" PRIMARY KEY ("id"))`)
        await db.query(`CREATE INDEX "IDX_e57036092dfbee152397f41dc3" ON "dex_fee_rate" ("pool_id") `)
    }

    async down(db) {
        await db.query(`DROP TABLE "dex_fee_rate"`)
        await db.query(`DROP INDEX "public"."IDX_e57036092dfbee152397f41dc3"`)
    }
}
