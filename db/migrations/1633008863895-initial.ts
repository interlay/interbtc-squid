import {MigrationInterface, QueryRunner} from "typeorm";

export class initial1633008863895 implements MigrationInterface {
    name = 'initial1633008863895'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "refund" ("id" character varying NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "created_by_id" character varying NOT NULL, "updated_at" TIMESTAMP DEFAULT now(), "updated_by_id" character varying, "deleted_at" TIMESTAMP, "deleted_by_id" character varying, "version" integer NOT NULL, "issue_id" character varying NOT NULL, "refund_btc_address" character varying NOT NULL, "refund_amount_btc" numeric, CONSTRAINT "REL_155f5e24f46ccf0389dd0a21d6" UNIQUE ("issue_id"), CONSTRAINT "PK_f1cefa2e60d99b206c46c1116e5" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "issue" ("id" character varying NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "created_by_id" character varying NOT NULL, "updated_at" TIMESTAMP DEFAULT now(), "updated_by_id" character varying, "deleted_at" TIMESTAMP, "deleted_by_id" character varying, "version" integer NOT NULL, "wrapped_amount" numeric NOT NULL, "user_parachain_address" character varying NOT NULL, "bridge_fee" numeric NOT NULL, "griefing_collateral" numeric NOT NULL, "vault_wallet_pubkey" character varying NOT NULL, "creation_block" integer NOT NULL, "creation_timestamp" integer NOT NULL, "vault_backing_address" character varying NOT NULL, "vault_parachain_address" character varying NOT NULL, "btc_tx_id" character varying, "confirmations" integer, "btc_block_height" integer, "btc_amount_submitted_by_user" numeric, "status" character varying, "executed_amount_btc" numeric, CONSTRAINT "PK_f80e086c249b9f3f3ff2fd321b7" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "refund" ADD CONSTRAINT "FK_155f5e24f46ccf0389dd0a21d62" FOREIGN KEY ("issue_id") REFERENCES "issue"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "refund" DROP CONSTRAINT "FK_155f5e24f46ccf0389dd0a21d62"`);
        await queryRunner.query(`DROP TABLE "issue"`);
        await queryRunner.query(`DROP TABLE "refund"`);
    }

}
