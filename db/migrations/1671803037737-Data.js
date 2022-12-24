module.exports = class Data1671803037737 {
    name = 'Data1671803037737'

    async up(db) {
        await db.query(`CREATE TABLE "loans_market" ("id" character varying NOT NULL, "token" jsonb NOT NULL, "timestamp" TIMESTAMP WITH TIME ZONE NOT NULL, "height_id" character varying, CONSTRAINT "PK_6b32d7e7f128c43046f490fd8fe" PRIMARY KEY ("id"))`)
        await db.query(`CREATE INDEX "IDX_b23ef1d3b68ca858aca04a90d1" ON "loans_market" ("height_id") `)
        await db.query(`ALTER TABLE "loans_market" ADD CONSTRAINT "FK_b23ef1d3b68ca858aca04a90d15" FOREIGN KEY ("height_id") REFERENCES "height"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`)
    }

    async down(db) {
        await db.query(`DROP TABLE "loans_market"`)
        await db.query(`DROP INDEX "public"."IDX_b23ef1d3b68ca858aca04a90d1"`)
        await db.query(`ALTER TABLE "loans_market" DROP CONSTRAINT "FK_b23ef1d3b68ca858aca04a90d15"`)
    }
}
