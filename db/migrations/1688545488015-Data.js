module.exports = class Data1688545488015 {
    name = 'Data1688545488015'

    async up(db) {
        await db.query(`CREATE TABLE "cumulative_circulating_supply" ("id" character varying NOT NULL, "till_timestamp" TIMESTAMP WITH TIME ZONE NOT NULL, "symbol" text NOT NULL, "amount_circulating" numeric NOT NULL, "amount_circulating_human" numeric NOT NULL, "amount_issued" numeric NOT NULL, "amount_issued_human" numeric NOT NULL, "amount_locked" numeric NOT NULL, "amount_locked_human" numeric NOT NULL, "amount_reserved" numeric NOT NULL, "amount_reserved_human" numeric NOT NULL, "amount_system_accounts" numeric NOT NULL, "amount_system_accounts_human" numeric NOT NULL, "currency" jsonb NOT NULL, "height_id" character varying, CONSTRAINT "PK_66f6b6427d35605e4665395ceca" PRIMARY KEY ("id"))`)
        await db.query(`CREATE INDEX "IDX_d27e66078cfee4f97f99e98f13" ON "cumulative_circulating_supply" ("height_id") `)
        await db.query(`CREATE INDEX "IDX_75165aab9d2dfc820eb3f8e9a9" ON "cumulative_circulating_supply" ("till_timestamp") `)
        await db.query(`ALTER TABLE "cumulative_circulating_supply" ADD CONSTRAINT "FK_d27e66078cfee4f97f99e98f136" FOREIGN KEY ("height_id") REFERENCES "height"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`)
    }

    async down(db) {
        await db.query(`DROP TABLE "cumulative_circulating_supply"`)
        await db.query(`DROP INDEX "public"."IDX_d27e66078cfee4f97f99e98f13"`)
        await db.query(`DROP INDEX "public"."IDX_75165aab9d2dfc820eb3f8e9a9"`)
        await db.query(`ALTER TABLE "cumulative_circulating_supply" DROP CONSTRAINT "FK_d27e66078cfee4f97f99e98f136"`)
    }
}
