import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateQuotes1794248741942 implements MigrationInterface {
  name = 'CreateQuotes1794248741942';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "quotes" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "fullName" character varying NOT NULL, "email" character varying NOT NULL, "address" character varying NOT NULL, "monthlyConsumptionKwh" numeric NOT NULL, "systemSizeKw" numeric NOT NULL, "downPayment" numeric NOT NULL DEFAULT '0', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_99a0e8bcbcd8719d3a41f23c263" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_dcab96e44e48f51b62f3af2f44" ON "quotes"  ("email") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_f43c6dc5025ec8a9a3a2414686" ON "quotes"  ("createdAt") `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."IDX_f43c6dc5025ec8a9a3a2414686"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_dcab96e44e48f51b62f3af2f44"`,
    );
    await queryRunner.query(`DROP TABLE "quotes"`);
  }
}
