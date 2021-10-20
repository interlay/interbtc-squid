import {MigrationInterface, QueryRunner} from "typeorm";

export class redeem1634144533394 implements MigrationInterface {
    name = 'redeem1634144533394'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "public"."issue_request" RENAME COLUMN "block" TO "height_id"`);
        await queryRunner.query(`CREATE TABLE "issue_execution" ("id" character varying NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "created_by_id" character varying NOT NULL, "updated_at" TIMESTAMP DEFAULT now(), "updated_by_id" character varying, "deleted_at" TIMESTAMP, "deleted_by_id" character varying, "version" integer NOT NULL, "issue_id" character varying NOT NULL, "executed_amount_wrapped" numeric NOT NULL, "height_id" character varying NOT NULL, "timestamp" numeric NOT NULL, CONSTRAINT "REL_17af026c038d929c125077dd89" UNIQUE ("issue_id"), CONSTRAINT "PK_13ffeb07d7daefc867ab805e111" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "issue_cancellation" ("id" character varying NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "created_by_id" character varying NOT NULL, "updated_at" TIMESTAMP DEFAULT now(), "updated_by_id" character varying, "deleted_at" TIMESTAMP, "deleted_by_id" character varying, "version" integer NOT NULL, "issue_id" character varying NOT NULL, "height_id" character varying NOT NULL, "timestamp" numeric NOT NULL, CONSTRAINT "REL_7d5b640028a9cd5a6984fe7d9d" UNIQUE ("issue_id"), CONSTRAINT "PK_b10189e5800b6ee824138100f1e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "redeem_request" ("id" character varying NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "created_by_id" character varying NOT NULL, "updated_at" TIMESTAMP DEFAULT now(), "updated_by_id" character varying, "deleted_at" TIMESTAMP, "deleted_by_id" character varying, "version" integer NOT NULL, "redeem_id" character varying NOT NULL, "requested_amount_backing" numeric NOT NULL, "height_id" character varying NOT NULL, "timestamp" numeric NOT NULL, CONSTRAINT "REL_86cb3047c7064dbdabeabdeaff" UNIQUE ("redeem_id"), CONSTRAINT "PK_cfc413a4a56777d07b29de675fa" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "redeem_payment" ("id" character varying NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "created_by_id" character varying NOT NULL, "updated_at" TIMESTAMP DEFAULT now(), "updated_by_id" character varying, "deleted_at" TIMESTAMP, "deleted_by_id" character varying, "version" integer NOT NULL, "redeem_id" character varying NOT NULL, "btc_tx_id" character varying NOT NULL, "confirmations" integer NOT NULL, "block_height" integer, CONSTRAINT "REL_3cc79caec8511c7456001e1ec5" UNIQUE ("redeem_id"), CONSTRAINT "PK_20042e4b1f94c588a6ea2099d3d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "redeem_execution" ("id" character varying NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "created_by_id" character varying NOT NULL, "updated_at" TIMESTAMP DEFAULT now(), "updated_by_id" character varying, "deleted_at" TIMESTAMP, "deleted_by_id" character varying, "version" integer NOT NULL, "redeem_id" character varying NOT NULL, "height_id" character varying NOT NULL, "timestamp" numeric NOT NULL, CONSTRAINT "REL_62e67fcde38dc7cb01ae90fa98" UNIQUE ("redeem_id"), CONSTRAINT "PK_566435fc3bd9966b7bcbda1cc21" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "redeem" ("id" character varying NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "created_by_id" character varying NOT NULL, "updated_at" TIMESTAMP DEFAULT now(), "updated_by_id" character varying, "deleted_at" TIMESTAMP, "deleted_by_id" character varying, "version" integer NOT NULL, "bridge_fee" numeric NOT NULL, "collateral_premium" numeric NOT NULL, "btc_transfer_fee" numeric NOT NULL, "user_parachain_address" character varying NOT NULL, "user_backing_address" character varying NOT NULL, "vault_parachain_address" character varying NOT NULL, "status" character varying, CONSTRAINT "PK_49cd0f39502eb73258b6c51eeb4" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "redeem_cancellation" ("id" character varying NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "created_by_id" character varying NOT NULL, "updated_at" TIMESTAMP DEFAULT now(), "updated_by_id" character varying, "deleted_at" TIMESTAMP, "deleted_by_id" character varying, "version" integer NOT NULL, "redeem_id" character varying NOT NULL, "height_id" character varying NOT NULL, "timestamp" numeric NOT NULL, "reimbursed" boolean NOT NULL, CONSTRAINT "REL_05f6e4f3c974c60fbd7ccb686d" UNIQUE ("redeem_id"), CONSTRAINT "PK_d1961c09cd40e1f2e8195cc9a46" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "height" ("id" character varying NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "created_by_id" character varying NOT NULL, "updated_at" TIMESTAMP DEFAULT now(), "updated_by_id" character varying, "deleted_at" TIMESTAMP, "deleted_by_id" character varying, "version" integer NOT NULL, "absolute" numeric NOT NULL, "active" integer NOT NULL, CONSTRAINT "UQ_fe03a1fb7b771bdb2e4bb276237" UNIQUE ("absolute"), CONSTRAINT "PK_90f1773799ae13708b533416960" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "public"."issue_request" DROP COLUMN "height_id"`);
        await queryRunner.query(`ALTER TABLE "public"."issue_request" ADD "height_id" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "public"."issue_request" ADD CONSTRAINT "FK_7e85cb99b46407069c6efc924a3" FOREIGN KEY ("height_id") REFERENCES "height"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "issue_execution" ADD CONSTRAINT "FK_17af026c038d929c125077dd89e" FOREIGN KEY ("issue_id") REFERENCES "issue"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "issue_execution" ADD CONSTRAINT "FK_3be4fef6a0445542a129fd77eab" FOREIGN KEY ("height_id") REFERENCES "height"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "issue_cancellation" ADD CONSTRAINT "FK_7d5b640028a9cd5a6984fe7d9d2" FOREIGN KEY ("issue_id") REFERENCES "issue"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "issue_cancellation" ADD CONSTRAINT "FK_5e4274015579c9823d8a6565e14" FOREIGN KEY ("height_id") REFERENCES "height"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "redeem_request" ADD CONSTRAINT "FK_86cb3047c7064dbdabeabdeaffa" FOREIGN KEY ("redeem_id") REFERENCES "redeem"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "redeem_request" ADD CONSTRAINT "FK_eb25fe3aa73458cd0e8aaee7192" FOREIGN KEY ("height_id") REFERENCES "height"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "redeem_payment" ADD CONSTRAINT "FK_3cc79caec8511c7456001e1ec5e" FOREIGN KEY ("redeem_id") REFERENCES "redeem"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "redeem_execution" ADD CONSTRAINT "FK_62e67fcde38dc7cb01ae90fa987" FOREIGN KEY ("redeem_id") REFERENCES "redeem"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "redeem_execution" ADD CONSTRAINT "FK_424eea20ecb35e74113197588be" FOREIGN KEY ("height_id") REFERENCES "height"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "redeem_cancellation" ADD CONSTRAINT "FK_05f6e4f3c974c60fbd7ccb686dd" FOREIGN KEY ("redeem_id") REFERENCES "redeem"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "redeem_cancellation" ADD CONSTRAINT "FK_c71906f269d1aeea9dd086f9512" FOREIGN KEY ("height_id") REFERENCES "height"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "redeem_cancellation" DROP CONSTRAINT "FK_c71906f269d1aeea9dd086f9512"`);
        await queryRunner.query(`ALTER TABLE "redeem_cancellation" DROP CONSTRAINT "FK_05f6e4f3c974c60fbd7ccb686dd"`);
        await queryRunner.query(`ALTER TABLE "redeem_execution" DROP CONSTRAINT "FK_424eea20ecb35e74113197588be"`);
        await queryRunner.query(`ALTER TABLE "redeem_execution" DROP CONSTRAINT "FK_62e67fcde38dc7cb01ae90fa987"`);
        await queryRunner.query(`ALTER TABLE "redeem_payment" DROP CONSTRAINT "FK_3cc79caec8511c7456001e1ec5e"`);
        await queryRunner.query(`ALTER TABLE "redeem_request" DROP CONSTRAINT "FK_eb25fe3aa73458cd0e8aaee7192"`);
        await queryRunner.query(`ALTER TABLE "redeem_request" DROP CONSTRAINT "FK_86cb3047c7064dbdabeabdeaffa"`);
        await queryRunner.query(`ALTER TABLE "issue_cancellation" DROP CONSTRAINT "FK_5e4274015579c9823d8a6565e14"`);
        await queryRunner.query(`ALTER TABLE "issue_cancellation" DROP CONSTRAINT "FK_7d5b640028a9cd5a6984fe7d9d2"`);
        await queryRunner.query(`ALTER TABLE "issue_execution" DROP CONSTRAINT "FK_3be4fef6a0445542a129fd77eab"`);
        await queryRunner.query(`ALTER TABLE "issue_execution" DROP CONSTRAINT "FK_17af026c038d929c125077dd89e"`);
        await queryRunner.query(`ALTER TABLE "public"."issue_request" DROP CONSTRAINT "FK_7e85cb99b46407069c6efc924a3"`);
        await queryRunner.query(`ALTER TABLE "public"."issue_request" DROP COLUMN "height_id"`);
        await queryRunner.query(`ALTER TABLE "public"."issue_request" ADD "height_id" integer NOT NULL`);
        await queryRunner.query(`DROP TABLE "height"`);
        await queryRunner.query(`DROP TABLE "redeem_cancellation"`);
        await queryRunner.query(`DROP TABLE "redeem"`);
        await queryRunner.query(`DROP TABLE "redeem_execution"`);
        await queryRunner.query(`DROP TABLE "redeem_payment"`);
        await queryRunner.query(`DROP TABLE "redeem_request"`);
        await queryRunner.query(`DROP TABLE "issue_cancellation"`);
        await queryRunner.query(`DROP TABLE "issue_execution"`);
        await queryRunner.query(`ALTER TABLE "public"."issue_request" RENAME COLUMN "height_id" TO "block"`);
    }

}
