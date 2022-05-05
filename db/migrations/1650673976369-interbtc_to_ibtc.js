module.exports = class interbtc_to_ibtc1650673976369 {
  name = 'interbtc_to_ibtc1650673976369'

  async up(db) {
    await db.query(`ALTER TABLE "vault" DROP COLUMN "collateral_token"`)
    await db.query(`ALTER TABLE "vault" ADD "collateral_token" character varying(4) NOT NULL`)
    await db.query(`ALTER TABLE "vault" DROP COLUMN "wrapped_token"`)
    await db.query(`ALTER TABLE "vault" ADD "wrapped_token" character varying(4) NOT NULL`)
    await db.query(`ALTER TABLE "cumulative_volume_per_currency_pair" DROP COLUMN "wrapped_currency"`)
    await db.query(`ALTER TABLE "cumulative_volume_per_currency_pair" ADD "wrapped_currency" character varying(4)`)
    await db.query(`ALTER TABLE "cumulative_volume_per_currency_pair" DROP COLUMN "collateral_currency"`)
    await db.query(`ALTER TABLE "cumulative_volume_per_currency_pair" ADD "collateral_currency" character varying(4)`)
  }

  async down(db) {
    await db.query(`ALTER TABLE "vault" ADD "collateral_token" character varying(8) NOT NULL`)
    await db.query(`ALTER TABLE "vault" DROP COLUMN "collateral_token"`)
    await db.query(`ALTER TABLE "vault" ADD "wrapped_token" character varying(8) NOT NULL`)
    await db.query(`ALTER TABLE "vault" DROP COLUMN "wrapped_token"`)
    await db.query(`ALTER TABLE "cumulative_volume_per_currency_pair" ADD "wrapped_currency" character varying(8)`)
    await db.query(`ALTER TABLE "cumulative_volume_per_currency_pair" DROP COLUMN "wrapped_currency"`)
    await db.query(`ALTER TABLE "cumulative_volume_per_currency_pair" ADD "collateral_currency" character varying(8)`)
    await db.query(`ALTER TABLE "cumulative_volume_per_currency_pair" DROP COLUMN "collateral_currency"`)
  }
}
