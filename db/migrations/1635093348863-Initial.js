const { MigrationInterface, QueryRunner } = require("typeorm");

module.exports = class Initial1635093348863 {
    name = 'Initial1635093348863'

    async up(queryRunner) {
        await queryRunner.query(`CREATE TABLE "vault_registration" ("id" character varying NOT NULL, "block" integer NOT NULL, "timestamp" TIMESTAMP WITH TIME ZONE NOT NULL, CONSTRAINT "PK_08a8296b60ed6b3927996c6044b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "height" ("id" character varying NOT NULL, "absolute" numeric NOT NULL, "active" integer NOT NULL, CONSTRAINT "PK_90f1773799ae13708b533416960" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "issue_payment" ("id" character varying NOT NULL, "btc_tx_id" text NOT NULL, "confirmations" integer NOT NULL, "block_height" integer, "amount" numeric NOT NULL, "issue_id" character varying NOT NULL, CONSTRAINT "REL_1f6fb49d1dd84a72aadace2d16" UNIQUE ("issue_id"), CONSTRAINT "PK_0cc9f8dc537ecf5fa4fbc49ab4d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_1f6fb49d1dd84a72aadace2d16" ON "issue_payment" ("issue_id") `);
        await queryRunner.query(`CREATE TABLE "issue_execution" ("id" character varying NOT NULL, "executed_amount_wrapped" numeric NOT NULL, "timestamp" TIMESTAMP WITH TIME ZONE NOT NULL, "issue_id" character varying NOT NULL, "height_id" character varying NOT NULL, CONSTRAINT "REL_17af026c038d929c125077dd89" UNIQUE ("issue_id"), CONSTRAINT "PK_13ffeb07d7daefc867ab805e111" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_17af026c038d929c125077dd89" ON "issue_execution" ("issue_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_3be4fef6a0445542a129fd77ea" ON "issue_execution" ("height_id") `);
        await queryRunner.query(`CREATE TABLE "issue_cancellation" ("id" character varying NOT NULL, "timestamp" TIMESTAMP WITH TIME ZONE NOT NULL, "issue_id" character varying NOT NULL, "height_id" character varying NOT NULL, CONSTRAINT "REL_7d5b640028a9cd5a6984fe7d9d" UNIQUE ("issue_id"), CONSTRAINT "PK_b10189e5800b6ee824138100f1e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_7d5b640028a9cd5a6984fe7d9d" ON "issue_cancellation" ("issue_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_5e4274015579c9823d8a6565e1" ON "issue_cancellation" ("height_id") `);
        await queryRunner.query(`CREATE TABLE "refund" ("id" character varying NOT NULL, "refund_btc_address" text NOT NULL, "refund_amount_btc" numeric, "issue_id" character varying NOT NULL, CONSTRAINT "REL_155f5e24f46ccf0389dd0a21d6" UNIQUE ("issue_id"), CONSTRAINT "PK_f1cefa2e60d99b206c46c1116e5" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_155f5e24f46ccf0389dd0a21d6" ON "refund" ("issue_id") `);
        await queryRunner.query(`CREATE TABLE "issue" ("id" character varying NOT NULL, "request" jsonb NOT NULL, "bridge_fee" numeric NOT NULL, "griefing_collateral" numeric NOT NULL, "user_parachain_address" text NOT NULL, "vault_wallet_pubkey" text NOT NULL, "vault_backing_address" text NOT NULL, "vault_parachain_address" text NOT NULL, "status" character varying(30), CONSTRAINT "PK_f80e086c249b9f3f3ff2fd321b7" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "redeem_payment" ("id" character varying NOT NULL, "btc_tx_id" text NOT NULL, "confirmations" integer NOT NULL, "block_height" integer, "redeem_id" character varying NOT NULL, CONSTRAINT "REL_3cc79caec8511c7456001e1ec5" UNIQUE ("redeem_id"), CONSTRAINT "PK_20042e4b1f94c588a6ea2099d3d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_3cc79caec8511c7456001e1ec5" ON "redeem_payment" ("redeem_id") `);
        await queryRunner.query(`CREATE TABLE "redeem_execution" ("id" character varying NOT NULL, "timestamp" TIMESTAMP WITH TIME ZONE NOT NULL, "redeem_id" character varying NOT NULL, "height_id" character varying NOT NULL, CONSTRAINT "REL_62e67fcde38dc7cb01ae90fa98" UNIQUE ("redeem_id"), CONSTRAINT "PK_566435fc3bd9966b7bcbda1cc21" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_62e67fcde38dc7cb01ae90fa98" ON "redeem_execution" ("redeem_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_424eea20ecb35e74113197588b" ON "redeem_execution" ("height_id") `);
        await queryRunner.query(`CREATE TABLE "redeem_cancellation" ("id" character varying NOT NULL, "timestamp" TIMESTAMP WITH TIME ZONE NOT NULL, "reimbursed" boolean NOT NULL, "redeem_id" character varying NOT NULL, "height_id" character varying NOT NULL, CONSTRAINT "REL_05f6e4f3c974c60fbd7ccb686d" UNIQUE ("redeem_id"), CONSTRAINT "PK_d1961c09cd40e1f2e8195cc9a46" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_05f6e4f3c974c60fbd7ccb686d" ON "redeem_cancellation" ("redeem_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_c71906f269d1aeea9dd086f951" ON "redeem_cancellation" ("height_id") `);
        await queryRunner.query(`CREATE TABLE "redeem" ("id" character varying NOT NULL, "request" jsonb NOT NULL, "bridge_fee" numeric NOT NULL, "collateral_premium" numeric NOT NULL, "btc_transfer_fee" numeric NOT NULL, "user_parachain_address" text NOT NULL, "user_backing_address" text NOT NULL, "vault_parachain_address" text NOT NULL, "status" character varying(30), CONSTRAINT "PK_49cd0f39502eb73258b6c51eeb4" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "issue_payment" ADD CONSTRAINT "FK_1f6fb49d1dd84a72aadace2d167" FOREIGN KEY ("issue_id") REFERENCES "issue"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "issue_execution" ADD CONSTRAINT "FK_17af026c038d929c125077dd89e" FOREIGN KEY ("issue_id") REFERENCES "issue"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "issue_execution" ADD CONSTRAINT "FK_3be4fef6a0445542a129fd77eab" FOREIGN KEY ("height_id") REFERENCES "height"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "issue_cancellation" ADD CONSTRAINT "FK_7d5b640028a9cd5a6984fe7d9d2" FOREIGN KEY ("issue_id") REFERENCES "issue"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "issue_cancellation" ADD CONSTRAINT "FK_5e4274015579c9823d8a6565e14" FOREIGN KEY ("height_id") REFERENCES "height"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "refund" ADD CONSTRAINT "FK_155f5e24f46ccf0389dd0a21d62" FOREIGN KEY ("issue_id") REFERENCES "issue"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "redeem_payment" ADD CONSTRAINT "FK_3cc79caec8511c7456001e1ec5e" FOREIGN KEY ("redeem_id") REFERENCES "redeem"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "redeem_execution" ADD CONSTRAINT "FK_62e67fcde38dc7cb01ae90fa987" FOREIGN KEY ("redeem_id") REFERENCES "redeem"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "redeem_execution" ADD CONSTRAINT "FK_424eea20ecb35e74113197588be" FOREIGN KEY ("height_id") REFERENCES "height"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "redeem_cancellation" ADD CONSTRAINT "FK_05f6e4f3c974c60fbd7ccb686dd" FOREIGN KEY ("redeem_id") REFERENCES "redeem"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "redeem_cancellation" ADD CONSTRAINT "FK_c71906f269d1aeea9dd086f9512" FOREIGN KEY ("height_id") REFERENCES "height"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "redeem_cancellation" DROP CONSTRAINT "FK_c71906f269d1aeea9dd086f9512"`);
        await queryRunner.query(`ALTER TABLE "redeem_cancellation" DROP CONSTRAINT "FK_05f6e4f3c974c60fbd7ccb686dd"`);
        await queryRunner.query(`ALTER TABLE "redeem_execution" DROP CONSTRAINT "FK_424eea20ecb35e74113197588be"`);
        await queryRunner.query(`ALTER TABLE "redeem_execution" DROP CONSTRAINT "FK_62e67fcde38dc7cb01ae90fa987"`);
        await queryRunner.query(`ALTER TABLE "redeem_payment" DROP CONSTRAINT "FK_3cc79caec8511c7456001e1ec5e"`);
        await queryRunner.query(`ALTER TABLE "refund" DROP CONSTRAINT "FK_155f5e24f46ccf0389dd0a21d62"`);
        await queryRunner.query(`ALTER TABLE "issue_cancellation" DROP CONSTRAINT "FK_5e4274015579c9823d8a6565e14"`);
        await queryRunner.query(`ALTER TABLE "issue_cancellation" DROP CONSTRAINT "FK_7d5b640028a9cd5a6984fe7d9d2"`);
        await queryRunner.query(`ALTER TABLE "issue_execution" DROP CONSTRAINT "FK_3be4fef6a0445542a129fd77eab"`);
        await queryRunner.query(`ALTER TABLE "issue_execution" DROP CONSTRAINT "FK_17af026c038d929c125077dd89e"`);
        await queryRunner.query(`ALTER TABLE "issue_payment" DROP CONSTRAINT "FK_1f6fb49d1dd84a72aadace2d167"`);
        await queryRunner.query(`DROP TABLE "redeem"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_c71906f269d1aeea9dd086f951"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_05f6e4f3c974c60fbd7ccb686d"`);
        await queryRunner.query(`DROP TABLE "redeem_cancellation"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_424eea20ecb35e74113197588b"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_62e67fcde38dc7cb01ae90fa98"`);
        await queryRunner.query(`DROP TABLE "redeem_execution"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_3cc79caec8511c7456001e1ec5"`);
        await queryRunner.query(`DROP TABLE "redeem_payment"`);
        await queryRunner.query(`DROP TABLE "issue"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_155f5e24f46ccf0389dd0a21d6"`);
        await queryRunner.query(`DROP TABLE "refund"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_5e4274015579c9823d8a6565e1"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_7d5b640028a9cd5a6984fe7d9d"`);
        await queryRunner.query(`DROP TABLE "issue_cancellation"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_3be4fef6a0445542a129fd77ea"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_17af026c038d929c125077dd89"`);
        await queryRunner.query(`DROP TABLE "issue_execution"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_1f6fb49d1dd84a72aadace2d16"`);
        await queryRunner.query(`DROP TABLE "issue_payment"`);
        await queryRunner.query(`DROP TABLE "height"`);
        await queryRunner.query(`DROP TABLE "vault_registration"`);
    }
}
