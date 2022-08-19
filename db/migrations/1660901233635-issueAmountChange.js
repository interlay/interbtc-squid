module.exports = class issueAmountChange1660901233635 {
  name = 'issueAmountChange1660901233635'

  async up(db) {
    await db.query(`CREATE TABLE "issue_amount_change" ("id" character varying NOT NULL, "amount_wrapped" numeric NOT NULL, "bridge_fee_wrapped" numeric NOT NULL, "confiscated_griefing_collateral" numeric NOT NULL, "issue_id" character varying NOT NULL, "height_id" character varying NOT NULL, CONSTRAINT "REL_21486353e717585b8cc4f7a24f" UNIQUE ("issue_id"), CONSTRAINT "PK_1c925ed7ba22247dc6dee12d177" PRIMARY KEY ("id"))`)
    await db.query(`CREATE UNIQUE INDEX "IDX_21486353e717585b8cc4f7a24f" ON "issue_amount_change" ("issue_id") `)
    await db.query(`CREATE INDEX "IDX_ff4351c8e40604805832e15fdb" ON "issue_amount_change" ("height_id") `)
    await db.query(`ALTER TABLE "issue_amount_change" ADD CONSTRAINT "FK_21486353e717585b8cc4f7a24fc" FOREIGN KEY ("issue_id") REFERENCES "issue"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`)
    await db.query(`ALTER TABLE "issue_amount_change" ADD CONSTRAINT "FK_ff4351c8e40604805832e15fdbb" FOREIGN KEY ("height_id") REFERENCES "height"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`)
  }

  async down(db) {
    await db.query(`DROP TABLE "issue_amount_change"`)
    await db.query(`DROP INDEX "public"."IDX_21486353e717585b8cc4f7a24f"`)
    await db.query(`DROP INDEX "public"."IDX_ff4351c8e40604805832e15fdb"`)
    await db.query(`ALTER TABLE "issue_amount_change" DROP CONSTRAINT "FK_21486353e717585b8cc4f7a24fc"`)
    await db.query(`ALTER TABLE "issue_amount_change" DROP CONSTRAINT "FK_ff4351c8e40604805832e15fdbb"`)
  }
}
