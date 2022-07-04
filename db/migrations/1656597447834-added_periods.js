module.exports = class added_periods1656597447834 {
  name = 'added-periods1656597447834'

  async up(db) {
    await db.query(`CREATE TABLE "issue_period" ("id" character varying NOT NULL, "timestamp" TIMESTAMP WITH TIME ZONE NOT NULL, "value" integer NOT NULL, "height_id" character varying NOT NULL, CONSTRAINT "PK_acf83254351feaa72070b93855a" PRIMARY KEY ("id"))`)
    await db.query(`CREATE INDEX "IDX_ca3b923e940fbe3c597ae306b4" ON "issue_period" ("height_id") `)
    await db.query(`CREATE TABLE "redeem_period" ("id" character varying NOT NULL, "timestamp" TIMESTAMP WITH TIME ZONE NOT NULL, "value" integer NOT NULL, "height_id" character varying NOT NULL, CONSTRAINT "PK_19baa2bc29c8e15a4f62d20ba08" PRIMARY KEY ("id"))`)
    await db.query(`CREATE INDEX "IDX_6edb17bd1988bc14adc36cf74b" ON "redeem_period" ("height_id") `)
    await db.query(`ALTER TABLE "issue" ADD "period_id" character varying NOT NULL`)
    await db.query(`ALTER TABLE "redeem" ADD "period_id" character varying NOT NULL`)
    await db.query(`CREATE INDEX "IDX_acf83254351feaa72070b93855" ON "issue" ("period_id") `)
    await db.query(`CREATE INDEX "IDX_19baa2bc29c8e15a4f62d20ba0" ON "redeem" ("period_id") `)
    await db.query(`ALTER TABLE "issue_period" ADD CONSTRAINT "FK_ca3b923e940fbe3c597ae306b4c" FOREIGN KEY ("height_id") REFERENCES "height"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`)
    await db.query(`ALTER TABLE "issue" ADD CONSTRAINT "FK_acf83254351feaa72070b93855a" FOREIGN KEY ("period_id") REFERENCES "issue_period"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`)
    await db.query(`ALTER TABLE "redeem_period" ADD CONSTRAINT "FK_6edb17bd1988bc14adc36cf74b9" FOREIGN KEY ("height_id") REFERENCES "height"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`)
    await db.query(`ALTER TABLE "redeem" ADD CONSTRAINT "FK_19baa2bc29c8e15a4f62d20ba08" FOREIGN KEY ("period_id") REFERENCES "redeem_period"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`)
  }

  async down(db) {
    await db.query(`DROP TABLE "issue_period"`)
    await db.query(`DROP INDEX "public"."IDX_ca3b923e940fbe3c597ae306b4"`)
    await db.query(`DROP TABLE "redeem_period"`)
    await db.query(`DROP INDEX "public"."IDX_6edb17bd1988bc14adc36cf74b"`)
    await db.query(`ALTER TABLE "issue" DROP COLUMN "period_id"`)
    await db.query(`ALTER TABLE "redeem" DROP COLUMN "period_id"`)
    await db.query(`DROP INDEX "public"."IDX_acf83254351feaa72070b93855"`)
    await db.query(`DROP INDEX "public"."IDX_19baa2bc29c8e15a4f62d20ba0"`)
    await db.query(`ALTER TABLE "issue_period" DROP CONSTRAINT "FK_ca3b923e940fbe3c597ae306b4c"`)
    await db.query(`ALTER TABLE "issue" DROP CONSTRAINT "FK_acf83254351feaa72070b93855a"`)
    await db.query(`ALTER TABLE "redeem_period" DROP CONSTRAINT "FK_6edb17bd1988bc14adc36cf74b9"`)
    await db.query(`ALTER TABLE "redeem" DROP CONSTRAINT "FK_19baa2bc29c8e15a4f62d20ba08"`)
  }
}
