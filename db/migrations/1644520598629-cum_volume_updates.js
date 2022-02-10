module.exports = class cum_volume_updates1644520598629 {
  name = 'cum_volume_updates1644520598629'

  async up(db) {
    await db.query(`CREATE TABLE "cumulative_volume_per_collateral" ("id" character varying NOT NULL, "type" character varying(10) NOT NULL, "till_timestamp" TIMESTAMP WITH TIME ZONE NOT NULL, "amount" numeric NOT NULL, "collateral_currency" character varying(8) NOT NULL, CONSTRAINT "PK_05c5e03131838a062c09b7b64dc" PRIMARY KEY ("id"))`)
    await db.query(`ALTER TABLE "cumulative_volume" DROP COLUMN "type"`)
    await db.query(`ALTER TABLE "cumulative_volume" ADD "type" character varying(10) NOT NULL`)
  }

  async down(db) {
    await db.query(`DROP TABLE "cumulative_volume_per_collateral"`)
    await db.query(`ALTER TABLE "cumulative_volume" ADD "type" character varying(6) NOT NULL`)
    await db.query(`ALTER TABLE "cumulative_volume" DROP COLUMN "type"`)
  }
}
