module.exports = class Data1672194421917 {
    name = 'Data1672194421917'

    async up(db) {
        await db.query(`CREATE TABLE "loan" ("id" character varying NOT NULL, "token" jsonb NOT NULL, "user_parachain_address" text NOT NULL, "amount_borrowed" numeric, "amount_repaid" numeric, "timestamp" TIMESTAMP WITH TIME ZONE NOT NULL, "height_id" character varying, CONSTRAINT "PK_4ceda725a323d254a5fd48bf95f" PRIMARY KEY ("id"))`)
        await db.query(`CREATE INDEX "IDX_9d91bd14c2c870581c9cf6cf5c" ON "loan" ("height_id") `)
        await db.query(`CREATE TABLE "deposit" ("id" character varying NOT NULL, "token" jsonb NOT NULL, "user_parachain_address" text NOT NULL, "amount_deposited" numeric, "amount_withdrawn" numeric, "timestamp" TIMESTAMP WITH TIME ZONE NOT NULL, "height_id" character varying, CONSTRAINT "PK_6654b4be449dadfd9d03a324b61" PRIMARY KEY ("id"))`)
        await db.query(`CREATE INDEX "IDX_2737e86cc718982faf56d573df" ON "deposit" ("height_id") `)
        await db.query(`ALTER TABLE "loan" ADD CONSTRAINT "FK_9d91bd14c2c870581c9cf6cf5cf" FOREIGN KEY ("height_id") REFERENCES "height"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`)
        await db.query(`ALTER TABLE "deposit" ADD CONSTRAINT "FK_2737e86cc718982faf56d573dfb" FOREIGN KEY ("height_id") REFERENCES "height"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`)
    }

    async down(db) {
        await db.query(`DROP TABLE "loan"`)
        await db.query(`DROP INDEX "public"."IDX_9d91bd14c2c870581c9cf6cf5c"`)
        await db.query(`DROP TABLE "deposit"`)
        await db.query(`DROP INDEX "public"."IDX_2737e86cc718982faf56d573df"`)
        await db.query(`ALTER TABLE "loan" DROP CONSTRAINT "FK_9d91bd14c2c870581c9cf6cf5cf"`)
        await db.query(`ALTER TABLE "deposit" DROP CONSTRAINT "FK_2737e86cc718982faf56d573dfb"`)
    }
}
