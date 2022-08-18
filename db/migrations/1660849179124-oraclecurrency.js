module.exports = class oraclecurrency1660849179124 {
  name = 'oraclecurrency1660849179124'

  async up(db) {
    await db.query(`ALTER TABLE "oracle_update" DROP COLUMN "type_key"`)
    await db.query(`ALTER TABLE "oracle_update" ADD "type_key" jsonb`)
  }

  async down(db) {
    await db.query(`ALTER TABLE "oracle_update" ADD "type_key" text`)
    await db.query(`ALTER TABLE "oracle_update" DROP COLUMN "type_key"`)
  }
}
