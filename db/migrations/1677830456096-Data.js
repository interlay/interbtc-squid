module.exports = class Data1677830456096 {
    name = 'Data1677830456096'

    async up(db) {
        await db.query(`CREATE TABLE "interest_accrual" ("id" character varying NOT NULL, "underlying_currency" jsonb NOT NULL, "currency_symbol" text NOT NULL, "utilization_ratio" numeric NOT NULL, "borrow_rate" numeric NOT NULL, "supply_rate" numeric NOT NULL, "total_borrows" numeric NOT NULL, "total_reserves" numeric NOT NULL, "borrow_index" numeric NOT NULL, "total_borrows_native" numeric, "total_reserves_native" numeric, "borrow_index_native" numeric, "total_borrows_usdt" numeric, "total_reserves_usdt" numeric, "borrow_index_usdt" numeric, "borrow_rate_pct" numeric, "supply_rate_pct" numeric, "exchange_rate" numeric NOT NULL, "exchange_rate_float" numeric NOT NULL, "timestamp" TIMESTAMP WITH TIME ZONE NOT NULL, "comment" text, "height_id" character varying, CONSTRAINT "PK_04e314078a0862f6e560cb2f20d" PRIMARY KEY ("id"))`)
        await db.query(`CREATE INDEX "IDX_694b7e3931d4a1aa01f067f0c4" ON "interest_accrual" ("height_id") `)
        await db.query(`ALTER TABLE "loan_market" ADD "currency_symbol" text NOT NULL`)
        await db.query(`ALTER TABLE "loan" ADD "amount_borrowed_usdt" numeric`)
        await db.query(`ALTER TABLE "loan" ADD "amount_borrowed_btc" numeric`)
        await db.query(`ALTER TABLE "loan" ADD "amount_repaid_usdt" numeric`)
        await db.query(`ALTER TABLE "loan" ADD "amount_repaid_btc" numeric`)
        await db.query(`ALTER TABLE "loan" ADD "currency_symbol" text NOT NULL`)
        await db.query(`ALTER TABLE "deposit" ADD "symbol" text NOT NULL`)
        await db.query(`ALTER TABLE "deposit" ADD "type" text NOT NULL`)
        await db.query(`ALTER TABLE "deposit" ADD "amount_deposited_usdt" numeric`)
        await db.query(`ALTER TABLE "deposit" ADD "amount_deposited_btc" numeric`)
        await db.query(`ALTER TABLE "deposit" ADD "amount_withdrawn_usdt" numeric`)
        await db.query(`ALTER TABLE "deposit" ADD "amount_withdrawn_btc" numeric`)
        await db.query(`ALTER TABLE "deposit" ADD "currency_symbol" text NOT NULL`)
        await db.query(`ALTER TABLE "interest_accrual" ADD CONSTRAINT "FK_694b7e3931d4a1aa01f067f0c4c" FOREIGN KEY ("height_id") REFERENCES "height"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`)
    }

    async down(db) {
        await db.query(`DROP TABLE "interest_accrual"`)
        await db.query(`DROP INDEX "public"."IDX_694b7e3931d4a1aa01f067f0c4"`)
        await db.query(`ALTER TABLE "loan_market" DROP COLUMN "currency_symbol"`)
        await db.query(`ALTER TABLE "loan" DROP COLUMN "amount_borrowed_usdt"`)
        await db.query(`ALTER TABLE "loan" DROP COLUMN "amount_borrowed_btc"`)
        await db.query(`ALTER TABLE "loan" DROP COLUMN "amount_repaid_usdt"`)
        await db.query(`ALTER TABLE "loan" DROP COLUMN "amount_repaid_btc"`)
        await db.query(`ALTER TABLE "loan" DROP COLUMN "currency_symbol"`)
        await db.query(`ALTER TABLE "deposit" DROP COLUMN "symbol"`)
        await db.query(`ALTER TABLE "deposit" DROP COLUMN "type"`)
        await db.query(`ALTER TABLE "deposit" DROP COLUMN "amount_deposited_usdt"`)
        await db.query(`ALTER TABLE "deposit" DROP COLUMN "amount_deposited_btc"`)
        await db.query(`ALTER TABLE "deposit" DROP COLUMN "amount_withdrawn_usdt"`)
        await db.query(`ALTER TABLE "deposit" DROP COLUMN "amount_withdrawn_btc"`)
        await db.query(`ALTER TABLE "deposit" DROP COLUMN "currency_symbol"`)
        await db.query(`ALTER TABLE "interest_accrual" DROP CONSTRAINT "FK_694b7e3931d4a1aa01f067f0c4c"`)
    }
}
