module.exports = class Data1674876069120 {
    name = 'Data1674876069120'

    async up(db) {
        await db.query(`CREATE TABLE "interest_accrual" ("id" character varying NOT NULL, "underlying_currency" jsonb NOT NULL, "currency_symbol" text NOT NULL, "total_borrows" numeric, "total_reserves" numeric, "borrow_index" numeric, "utilization_ratio" integer, "borrow_rate" numeric, "supply_rate" numeric, "exchange_rate" numeric, "timestamp" TIMESTAMP WITH TIME ZONE NOT NULL, "comment" text, "height_id" character varying, CONSTRAINT "PK_04e314078a0862f6e560cb2f20d" PRIMARY KEY ("id"))`)
        await db.query(`CREATE INDEX "IDX_694b7e3931d4a1aa01f067f0c4" ON "interest_accrual" ("height_id") `)
        await db.query(`ALTER TABLE "interest_accrual" ADD CONSTRAINT "FK_694b7e3931d4a1aa01f067f0c4c" FOREIGN KEY ("height_id") REFERENCES "height"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`)
    }

    async down(db) {
        await db.query(`DROP TABLE "interest_accrual"`)
        await db.query(`DROP INDEX "public"."IDX_694b7e3931d4a1aa01f067f0c4"`)
        await db.query(`ALTER TABLE "interest_accrual" DROP CONSTRAINT "FK_694b7e3931d4a1aa01f067f0c4c"`)
    }
}
