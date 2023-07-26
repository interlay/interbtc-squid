module.exports = class Data1690345763274 {
    name = 'Data1690345763274'

    async up(db) {
        await db.query(`CREATE TABLE "loan_liquidation" ("id" character varying NOT NULL, "amount_repaid" numeric NOT NULL, "amount_repaid_human" numeric NOT NULL, "amount_repaid_token" jsonb NOT NULL, "seized_collateral" numeric NOT NULL, "seized_collateral_human" numeric NOT NULL, "seized_collateral_token" jsonb NOT NULL, "liquidation_cost" numeric NOT NULL, "liquidation_cost_human" numeric NOT NULL, "liquidation_cost_token" jsonb NOT NULL, "timestamp" TIMESTAMP WITH TIME ZONE NOT NULL, CONSTRAINT "PK_b09b54780f862b217fdf64e885b" PRIMARY KEY ("id"))`)
    }

    async down(db) {
        await db.query(`DROP TABLE "loan_liquidation"`)
    }
}