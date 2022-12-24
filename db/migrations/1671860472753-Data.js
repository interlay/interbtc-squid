module.exports = class Data1671860472753 {
    name = 'Data1671860472753'

    async up(db) {
        await db.query(`CREATE TABLE "loan_market" ("id" character varying NOT NULL, "token" jsonb NOT NULL, "timestamp" TIMESTAMP WITH TIME ZONE NOT NULL, "height_id" character varying, CONSTRAINT "PK_e015c33030af7b9cabee542c80f" PRIMARY KEY ("id"))`)
        await db.query(`CREATE INDEX "IDX_38be14a0f173998ffce0f785b8" ON "loan_market" ("height_id") `)
        await db.query(`ALTER TABLE "loan_market" ADD CONSTRAINT "FK_38be14a0f173998ffce0f785b8f" FOREIGN KEY ("height_id") REFERENCES "height"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`)
    }

    async down(db) {
        await db.query(`DROP TABLE "loan_market"`)
        await db.query(`DROP INDEX "public"."IDX_38be14a0f173998ffce0f785b8"`)
        await db.query(`ALTER TABLE "loan_market" DROP CONSTRAINT "FK_38be14a0f173998ffce0f785b8f"`)
    }
}
