module.exports = class Data1688466925010 {
    name = 'Data1688466925010'

    async up(db) {
        await db.query(`CREATE TABLE "native_currency_locks" ("id" character varying NOT NULL, "timestamp" TIMESTAMP WITH TIME ZONE NOT NULL, "type" character varying(10) NOT NULL, "amount" numeric NOT NULL, "amount_human" numeric NOT NULL, "account_id" text NOT NULL, "symbol" text NOT NULL, "token" character varying(4) NOT NULL, "height_id" character varying, CONSTRAINT "PK_444554f899953efc7eb7c2f573f" PRIMARY KEY ("id"))`)
        await db.query(`CREATE INDEX "IDX_9b14d7a05502ac95989c8b3e2a" ON "native_currency_locks" ("height_id") `)
        await db.query(`CREATE INDEX "IDX_0a8e1ccf32dbeb97cdeb1ba905" ON "native_currency_locks" ("timestamp") `)
        await db.query(`CREATE INDEX "IDX_f6a0b555b948f793ab101ef4a7" ON "native_currency_locks" ("type") `)
        await db.query(`ALTER TABLE "native_currency_locks" ADD CONSTRAINT "FK_9b14d7a05502ac95989c8b3e2af" FOREIGN KEY ("height_id") REFERENCES "height"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`)
    }

    async down(db) {
        await db.query(`DROP TABLE "native_currency_locks"`)
        await db.query(`DROP INDEX "public"."IDX_9b14d7a05502ac95989c8b3e2a"`)
        await db.query(`DROP INDEX "public"."IDX_0a8e1ccf32dbeb97cdeb1ba905"`)
        await db.query(`DROP INDEX "public"."IDX_f6a0b555b948f793ab101ef4a7"`)
        await db.query(`ALTER TABLE "native_currency_locks" DROP CONSTRAINT "FK_9b14d7a05502ac95989c8b3e2af"`)
    }
}
