module.exports = class transfer1660585965592 {
  name = 'transfer1660585965592'

  async up(db) {
    await db.query(`CREATE TABLE "transfer" ("id" character varying NOT NULL, "token" character varying(4) NOT NULL, "amount" numeric NOT NULL, "from" text NOT NULL, "to" text NOT NULL, "timestamp" TIMESTAMP WITH TIME ZONE NOT NULL, "height_id" character varying NOT NULL, CONSTRAINT "PK_fd9ddbdd49a17afcbe014401295" PRIMARY KEY ("id"))`)
    await db.query(`CREATE INDEX "IDX_be54ea276e0f665ffc38630fc0" ON "transfer" ("from") `)
    await db.query(`CREATE INDEX "IDX_4cbc37e8c3b47ded161f44c24f" ON "transfer" ("to") `)
    await db.query(`CREATE INDEX "IDX_89d515806f93bf55c6dcc03c45" ON "transfer" ("height_id") `)
    await db.query(`ALTER TABLE "transfer" ADD CONSTRAINT "FK_89d515806f93bf55c6dcc03c45b" FOREIGN KEY ("height_id") REFERENCES "height"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`)
  }

  async down(db) {
    await db.query(`DROP TABLE "transfer"`)
    await db.query(`DROP INDEX "public"."IDX_be54ea276e0f665ffc38630fc0"`)
    await db.query(`DROP INDEX "public"."IDX_4cbc37e8c3b47ded161f44c24f"`)
    await db.query(`DROP INDEX "public"."IDX_89d515806f93bf55c6dcc03c45"`)
    await db.query(`ALTER TABLE "transfer" DROP CONSTRAINT "FK_89d515806f93bf55c6dcc03c45b"`)
  }
}
