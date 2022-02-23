module.exports = class store_issue_open_btc_block1645616824155 {
  name = 'store_issue_open_btc_block1645616824155'

  async up(db) {
    await db.query(`CREATE INDEX "IDX_fe03a1fb7b771bdb2e4bb27623" ON "height" ("absolute") `)
    await db.query(`CREATE INDEX "IDX_da62235e5f15fa78c3afc5fb3e" ON "vault" ("account_id") `)
    await db.query(`CREATE INDEX "IDX_876c16842e82fda65927899ea6" ON "relayed_block" ("backing_height") `)
  }

  async down(db) {
    await db.query(`DROP INDEX "public"."IDX_fe03a1fb7b771bdb2e4bb27623"`)
    await db.query(`DROP INDEX "public"."IDX_da62235e5f15fa78c3afc5fb3e"`)
    await db.query(`DROP INDEX "public"."IDX_876c16842e82fda65927899ea6"`)
  }
}
