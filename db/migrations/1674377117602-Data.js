module.exports = class Data1674377117602 {
    name = 'Data1674377117602'

    async up(db) {
        await db.query(`CREATE TABLE "loan_market_activation" ("id" character varying NOT NULL, "token" jsonb NOT NULL, "timestamp" TIMESTAMP WITH TIME ZONE NOT NULL, "market_id" character varying NOT NULL, "height_id" character varying, CONSTRAINT "REL_c9596e4e44c3289adbc6c93ce8" UNIQUE ("market_id"), CONSTRAINT "PK_00c25b431b60a2154827eb4a76b" PRIMARY KEY ("id"))`)
        await db.query(`CREATE UNIQUE INDEX "IDX_c9596e4e44c3289adbc6c93ce8" ON "loan_market_activation" ("market_id") `)
        await db.query(`CREATE INDEX "IDX_b47d7a0d7b2bbd82490a7010db" ON "loan_market_activation" ("height_id") `)
        await db.query(`ALTER TABLE "loan_market" ADD "borrow_cap" numeric NOT NULL`)
        await db.query(`ALTER TABLE "loan_market" ADD "supply_cap" numeric NOT NULL`)
        await db.query(`ALTER TABLE "loan_market" ADD "rate_model" jsonb NOT NULL`)
        await db.query(`ALTER TABLE "loan_market" ADD "close_factor" integer NOT NULL`)
        await db.query(`ALTER TABLE "loan_market" ADD "lend_token_id" integer NOT NULL`)
        await db.query(`ALTER TABLE "loan_market" ADD "state" character varying(11) NOT NULL`)
        await db.query(`ALTER TABLE "loan_market" ADD "reserve_factor" integer NOT NULL`)
        await db.query(`ALTER TABLE "loan_market" ADD "collateral_factor" integer NOT NULL`)
        await db.query(`ALTER TABLE "loan_market" ADD "liquidate_incentive" numeric NOT NULL`)
        await db.query(`ALTER TABLE "loan_market" ADD "liquidation_threshold" integer NOT NULL`)
        await db.query(`ALTER TABLE "loan_market" ADD "liquidate_incentive_reserved_factor" integer NOT NULL`)
        await db.query(`ALTER TABLE "loan" ADD "comment" text`)
        await db.query(`ALTER TABLE "deposit" ADD "comment" text`)
        await db.query(`CREATE UNIQUE INDEX "IDX_20e4b93fc0a70cd45915b76ea8" ON "loan_market" ("lend_token_id") `)
        await db.query(`ALTER TABLE "loan_market_activation" ADD CONSTRAINT "FK_c9596e4e44c3289adbc6c93ce83" FOREIGN KEY ("market_id") REFERENCES "loan_market"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`)
        await db.query(`ALTER TABLE "loan_market_activation" ADD CONSTRAINT "FK_b47d7a0d7b2bbd82490a7010db1" FOREIGN KEY ("height_id") REFERENCES "height"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`)
    }

    async down(db) {
        await db.query(`DROP TABLE "loan_market_activation"`)
        await db.query(`DROP INDEX "public"."IDX_c9596e4e44c3289adbc6c93ce8"`)
        await db.query(`DROP INDEX "public"."IDX_b47d7a0d7b2bbd82490a7010db"`)
        await db.query(`ALTER TABLE "loan_market" DROP COLUMN "borrow_cap"`)
        await db.query(`ALTER TABLE "loan_market" DROP COLUMN "supply_cap"`)
        await db.query(`ALTER TABLE "loan_market" DROP COLUMN "rate_model"`)
        await db.query(`ALTER TABLE "loan_market" DROP COLUMN "close_factor"`)
        await db.query(`ALTER TABLE "loan_market" DROP COLUMN "lend_token_id"`)
        await db.query(`ALTER TABLE "loan_market" DROP COLUMN "state"`)
        await db.query(`ALTER TABLE "loan_market" DROP COLUMN "reserve_factor"`)
        await db.query(`ALTER TABLE "loan_market" DROP COLUMN "collateral_factor"`)
        await db.query(`ALTER TABLE "loan_market" DROP COLUMN "liquidate_incentive"`)
        await db.query(`ALTER TABLE "loan_market" DROP COLUMN "liquidation_threshold"`)
        await db.query(`ALTER TABLE "loan_market" DROP COLUMN "liquidate_incentive_reserved_factor"`)
        await db.query(`ALTER TABLE "loan" DROP COLUMN "comment"`)
        await db.query(`ALTER TABLE "deposit" DROP COLUMN "comment"`)
        await db.query(`DROP INDEX "public"."IDX_20e4b93fc0a70cd45915b76ea8"`)
        await db.query(`ALTER TABLE "loan_market_activation" DROP CONSTRAINT "FK_c9596e4e44c3289adbc6c93ce83"`)
        await db.query(`ALTER TABLE "loan_market_activation" DROP CONSTRAINT "FK_b47d7a0d7b2bbd82490a7010db1"`)
    }
}
