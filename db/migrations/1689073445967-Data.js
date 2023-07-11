module.exports = class Data1689073445967 {
    name = 'Data1689073445967'

    async up(db) {
        await db.query(`CREATE TABLE "cumulative_circulating_supply" ("id" character varying NOT NULL, "till_timestamp" TIMESTAMP WITH TIME ZONE NOT NULL, "symbol" text NOT NULL, "amount_circulating" numeric NOT NULL, "amount_circulating_human" numeric NOT NULL, "total_supply" numeric NOT NULL, "total_supply_human" numeric NOT NULL, "amount_locked" numeric NOT NULL, "amount_locked_human" numeric NOT NULL, "amount_reserved" numeric NOT NULL, "amount_reserved_human" numeric NOT NULL, "amount_system_accounts" numeric NOT NULL, "amount_system_accounts_human" numeric NOT NULL, "currency" jsonb NOT NULL, "height_id" character varying, CONSTRAINT "PK_66f6b6427d35605e4665395ceca" PRIMARY KEY ("id"))`)
        await db.query(`CREATE INDEX "IDX_d27e66078cfee4f97f99e98f13" ON "cumulative_circulating_supply" ("height_id") `)
        await db.query(`CREATE INDEX "IDX_75165aab9d2dfc820eb3f8e9a9" ON "cumulative_circulating_supply" ("till_timestamp") `)
        await db.query(`CREATE TABLE "token_lock" ("id" character varying NOT NULL, "account" text NOT NULL, "lock_id" text NOT NULL, "status" character varying(7) NOT NULL, "amount" numeric NOT NULL, "currency" jsonb NOT NULL, "symbol" text NOT NULL, "timestamp_set" TIMESTAMP WITH TIME ZONE NOT NULL, "timestamp_removed" TIMESTAMP WITH TIME ZONE, "height_set_id" character varying, "height_removed_id" character varying, CONSTRAINT "PK_9eb3d87c06c70bc39332661def8" PRIMARY KEY ("id"))`)
        await db.query(`CREATE INDEX "IDX_0f88969e6359238b0179741a8f" ON "token_lock" ("height_set_id") `)
        await db.query(`CREATE INDEX "IDX_e32583024794cd5458d3e638c5" ON "token_lock" ("height_removed_id") `)
        await db.query(`CREATE INDEX "IDX_e12c1b86f07e539e91ddd0fecd" ON "token_lock" ("account", "lock_id", "status") `)
        await db.query(`ALTER TABLE "cumulative_circulating_supply" ADD CONSTRAINT "FK_d27e66078cfee4f97f99e98f136" FOREIGN KEY ("height_id") REFERENCES "height"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`)
        await db.query(`ALTER TABLE "token_lock" ADD CONSTRAINT "FK_0f88969e6359238b0179741a8fd" FOREIGN KEY ("height_set_id") REFERENCES "height"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`)
        await db.query(`ALTER TABLE "token_lock" ADD CONSTRAINT "FK_e32583024794cd5458d3e638c56" FOREIGN KEY ("height_removed_id") REFERENCES "height"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`)
    }

    async down(db) {
        await db.query(`DROP TABLE "cumulative_circulating_supply"`)
        await db.query(`DROP INDEX "public"."IDX_d27e66078cfee4f97f99e98f13"`)
        await db.query(`DROP INDEX "public"."IDX_75165aab9d2dfc820eb3f8e9a9"`)
        await db.query(`DROP TABLE "token_lock"`)
        await db.query(`DROP INDEX "public"."IDX_0f88969e6359238b0179741a8f"`)
        await db.query(`DROP INDEX "public"."IDX_e32583024794cd5458d3e638c5"`)
        await db.query(`DROP INDEX "public"."IDX_e12c1b86f07e539e91ddd0fecd"`)
        await db.query(`ALTER TABLE "cumulative_circulating_supply" DROP CONSTRAINT "FK_d27e66078cfee4f97f99e98f136"`)
        await db.query(`ALTER TABLE "token_lock" DROP CONSTRAINT "FK_0f88969e6359238b0179741a8fd"`)
        await db.query(`ALTER TABLE "token_lock" DROP CONSTRAINT "FK_e32583024794cd5458d3e638c56"`)
    }
}
