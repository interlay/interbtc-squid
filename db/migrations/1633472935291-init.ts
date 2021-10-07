import {MigrationInterface, QueryRunner} from "typeorm";

export class init1633472935291 implements MigrationInterface {
    name = 'init1633472935291'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "issue_request" ("id" character varying NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "created_by_id" character varying NOT NULL, "updated_at" TIMESTAMP DEFAULT now(), "updated_by_id" character varying, "deleted_at" TIMESTAMP, "deleted_by_id" character varying, "version" integer NOT NULL, "issue_id" character varying NOT NULL, "requested_amount_wrapped" numeric NOT NULL, "block" integer NOT NULL, "timestamp" numeric NOT NULL, CONSTRAINT "REL_9fc8d1ffee6ece59316ab16197" UNIQUE ("issue_id"), CONSTRAINT "PK_498cd8089f9302db334fd7fe7f6" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "issue_payment" ("id" character varying NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "created_by_id" character varying NOT NULL, "updated_at" TIMESTAMP DEFAULT now(), "updated_by_id" character varying, "deleted_at" TIMESTAMP, "deleted_by_id" character varying, "version" integer NOT NULL, "issue_id" character varying NOT NULL, "btc_tx_id" character varying NOT NULL, "confirmations" integer NOT NULL, "block_height" integer, "amount" numeric NOT NULL, CONSTRAINT "REL_1f6fb49d1dd84a72aadace2d16" UNIQUE ("issue_id"), CONSTRAINT "PK_0cc9f8dc537ecf5fa4fbc49ab4d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "refund" ("id" character varying NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "created_by_id" character varying NOT NULL, "updated_at" TIMESTAMP DEFAULT now(), "updated_by_id" character varying, "deleted_at" TIMESTAMP, "deleted_by_id" character varying, "version" integer NOT NULL, "issue_id" character varying NOT NULL, "refund_btc_address" character varying NOT NULL, "refund_amount_btc" numeric, CONSTRAINT "REL_155f5e24f46ccf0389dd0a21d6" UNIQUE ("issue_id"), CONSTRAINT "PK_f1cefa2e60d99b206c46c1116e5" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "issue" ("id" character varying NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "created_by_id" character varying NOT NULL, "updated_at" TIMESTAMP DEFAULT now(), "updated_by_id" character varying, "deleted_at" TIMESTAMP, "deleted_by_id" character varying, "version" integer NOT NULL, "bridge_fee" numeric NOT NULL, "griefing_collateral" numeric NOT NULL, "user_parachain_address" character varying NOT NULL, "vault_wallet_pubkey" character varying NOT NULL, "vault_backing_address" character varying NOT NULL, "vault_parachain_address" character varying NOT NULL, "status" character varying, CONSTRAINT "PK_f80e086c249b9f3f3ff2fd321b7" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "execution" ("id" character varying NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "created_by_id" character varying NOT NULL, "updated_at" TIMESTAMP DEFAULT now(), "updated_by_id" character varying, "deleted_at" TIMESTAMP, "deleted_by_id" character varying, "version" integer NOT NULL, "issue_id" character varying NOT NULL, "executed_amount_wrapped" numeric NOT NULL, "block" integer NOT NULL, "timestamp" numeric NOT NULL, CONSTRAINT "REL_af46dd626e9706b3cbb36f1146" UNIQUE ("issue_id"), CONSTRAINT "PK_cc6684fedf29ec4c86db8448a2b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "vault_registration" ("id" character varying NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "created_by_id" character varying NOT NULL, "updated_at" TIMESTAMP DEFAULT now(), "updated_by_id" character varying, "deleted_at" TIMESTAMP, "deleted_by_id" character varying, "version" integer NOT NULL, "block" integer NOT NULL, "timestamp" numeric NOT NULL, CONSTRAINT "PK_08a8296b60ed6b3927996c6044b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "issue_request" ADD CONSTRAINT "FK_9fc8d1ffee6ece59316ab161978" FOREIGN KEY ("issue_id") REFERENCES "issue"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "issue_payment" ADD CONSTRAINT "FK_1f6fb49d1dd84a72aadace2d167" FOREIGN KEY ("issue_id") REFERENCES "issue"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "refund" ADD CONSTRAINT "FK_155f5e24f46ccf0389dd0a21d62" FOREIGN KEY ("issue_id") REFERENCES "issue"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "execution" ADD CONSTRAINT "FK_af46dd626e9706b3cbb36f1146a" FOREIGN KEY ("issue_id") REFERENCES "issue"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "execution" DROP CONSTRAINT "FK_af46dd626e9706b3cbb36f1146a"`);
        await queryRunner.query(`ALTER TABLE "refund" DROP CONSTRAINT "FK_155f5e24f46ccf0389dd0a21d62"`);
        await queryRunner.query(`ALTER TABLE "issue_payment" DROP CONSTRAINT "FK_1f6fb49d1dd84a72aadace2d167"`);
        await queryRunner.query(`ALTER TABLE "issue_request" DROP CONSTRAINT "FK_9fc8d1ffee6ece59316ab161978"`);
        await queryRunner.query(`DROP TABLE "vault_registration"`);
        await queryRunner.query(`DROP TABLE "execution"`);
        await queryRunner.query(`DROP TABLE "issue"`);
        await queryRunner.query(`DROP TABLE "refund"`);
        await queryRunner.query(`DROP TABLE "issue_payment"`);
        await queryRunner.query(`DROP TABLE "issue_request"`);
    }

}
