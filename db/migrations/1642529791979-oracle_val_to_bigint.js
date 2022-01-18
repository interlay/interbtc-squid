module.exports = class oracle_val_to_bigint1642529791979 {
  name = 'oracle_val_to_bigint1642529791979'

  async up(db) {
    await db.query(`ALTER TABLE "oracle_update" DROP COLUMN "update_value"`)
    await db.query(`ALTER TABLE "oracle_update" ADD "update_value" numeric NOT NULL`)
  }

  async down(db) {
    await db.query(`ALTER TABLE "oracle_update" ADD "update_value" text NOT NULL`)
    await db.query(`ALTER TABLE "oracle_update" DROP COLUMN "update_value"`)
  }
}
