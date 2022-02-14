module.exports = class update_cumulative_volumes1644843758426 {
  name = 'update_cumulative_volumes1644843758426'

  async up(db) {
    await db.query(`CREATE TABLE "cumulative_volume_per_currency_pair" ("id" character varying NOT NULL, "type" character varying(10) NOT NULL, "till_timestamp" TIMESTAMP WITH TIME ZONE NOT NULL, "amount" numeric NOT NULL, "wrapped_currency" character varying(8), "collateral_currency" character varying(8), CONSTRAINT "PK_b55d48297b58de0876411bb8f82" PRIMARY KEY ("id"))`)
  }

  async down(db) {
    await db.query(`DROP TABLE "cumulative_volume_per_currency_pair"`)
  }
}
