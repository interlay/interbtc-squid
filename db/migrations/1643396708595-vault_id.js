module.exports = class vault_id1643396708595 {
  name = 'vault_id1643396708595'

  async up(db) {
    await db.query(`ALTER TABLE "issue" RENAME COLUMN "vault_parachain_address" TO "vault_id"`)
    await db.query(`ALTER TABLE "redeem" RENAME COLUMN "vault_parachain_address" TO "vault_id"`)
    await db.query(`CREATE TABLE "daily_volume" ("id" character varying NOT NULL, "type" character varying(6) NOT NULL, "from_midnight" TIMESTAMP WITH TIME ZONE NOT NULL, "amount" numeric NOT NULL, CONSTRAINT "PK_16b2e73f99fb121dcc9e90ffd32" PRIMARY KEY ("id"))`)
    await db.query(`CREATE TABLE "cumulative_volume" ("id" character varying NOT NULL, "type" character varying(6) NOT NULL, "till_timestamp" TIMESTAMP WITH TIME ZONE NOT NULL, "amount" numeric NOT NULL, CONSTRAINT "PK_4cddeb1db9f5652b7f55e88e8d6" PRIMARY KEY ("id"))`)
    await db.query(`ALTER TABLE "vault" DROP COLUMN "registration_block"`)
    await db.query(`ALTER TABLE "vault" ADD "account_id" text NOT NULL`)
    await db.query(`ALTER TABLE "vault" ADD "collateral_token" character varying(8) NOT NULL`)
    await db.query(`ALTER TABLE "vault" ADD "wrapped_token" character varying(8) NOT NULL`)
    await db.query(`ALTER TABLE "vault" ADD "registration_block_id" character varying NOT NULL`)
    await db.query(`ALTER TABLE "issue" DROP COLUMN "vault_id"`)
    await db.query(`ALTER TABLE "issue" ADD "vault_id" character varying NOT NULL`)
    await db.query(`ALTER TABLE "redeem" DROP COLUMN "vault_id"`)
    await db.query(`ALTER TABLE "redeem" ADD "vault_id" character varying NOT NULL`)
    await db.query(`CREATE INDEX "IDX_8d7190b650d4a59bb459e72706" ON "vault" ("registration_block_id") `)
    await db.query(`CREATE INDEX "IDX_b3dcd45bbb9a9459ab7eb1112d" ON "issue" ("vault_id") `)
    await db.query(`CREATE INDEX "IDX_21e0e6dce8bedbb39f5d38ff39" ON "redeem" ("vault_id") `)
    await db.query(`ALTER TABLE "vault" ADD CONSTRAINT "FK_8d7190b650d4a59bb459e727062" FOREIGN KEY ("registration_block_id") REFERENCES "height"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`)
    await db.query(`ALTER TABLE "issue" ADD CONSTRAINT "FK_b3dcd45bbb9a9459ab7eb1112d2" FOREIGN KEY ("vault_id") REFERENCES "vault"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`)
    await db.query(`ALTER TABLE "redeem" ADD CONSTRAINT "FK_21e0e6dce8bedbb39f5d38ff39e" FOREIGN KEY ("vault_id") REFERENCES "vault"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`)
  }

  async down(db) {
    await db.query(`ALTER TABLE "issue" RENAME COLUMN "vault_id" TO "vault_parachain_address"`)
    await db.query(`ALTER TABLE "redeem" RENAME COLUMN "vault_id" TO "vault_parachain_address"`)
    await db.query(`DROP TABLE "daily_volume"`)
    await db.query(`DROP TABLE "cumulative_volume"`)
    await db.query(`ALTER TABLE "vault" ADD "registration_block" integer NOT NULL`)
    await db.query(`ALTER TABLE "vault" DROP COLUMN "account_id"`)
    await db.query(`ALTER TABLE "vault" DROP COLUMN "collateral_token"`)
    await db.query(`ALTER TABLE "vault" DROP COLUMN "wrapped_token"`)
    await db.query(`ALTER TABLE "vault" DROP COLUMN "registration_block_id"`)
    await db.query(`ALTER TABLE "issue" ADD "vault_id" text NOT NULL`)
    await db.query(`ALTER TABLE "issue" DROP COLUMN "vault_id"`)
    await db.query(`ALTER TABLE "redeem" ADD "vault_id" text NOT NULL`)
    await db.query(`ALTER TABLE "redeem" DROP COLUMN "vault_id"`)
    await db.query(`DROP INDEX "public"."IDX_8d7190b650d4a59bb459e72706"`)
    await db.query(`DROP INDEX "public"."IDX_b3dcd45bbb9a9459ab7eb1112d"`)
    await db.query(`DROP INDEX "public"."IDX_21e0e6dce8bedbb39f5d38ff39"`)
    await db.query(`ALTER TABLE "vault" DROP CONSTRAINT "FK_8d7190b650d4a59bb459e727062"`)
    await db.query(`ALTER TABLE "issue" DROP CONSTRAINT "FK_b3dcd45bbb9a9459ab7eb1112d2"`)
    await db.query(`ALTER TABLE "redeem" DROP CONSTRAINT "FK_21e0e6dce8bedbb39f5d38ff39e"`)
  }
}
