module.exports = class redeem_expiry1646837172764 {
  name = 'redeem_expiry1646837172764'

  async up(db) {
    await db.query(`CREATE INDEX "IDX_e7c81e44d6dd168bce123cc31e" ON "issue" ("status") `)
  }

  async down(db) {
    await db.query(`DROP INDEX "public"."IDX_e7c81e44d6dd168bce123cc31e"`)
  }
}
