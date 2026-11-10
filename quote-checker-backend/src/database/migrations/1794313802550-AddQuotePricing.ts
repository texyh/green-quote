import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddQuotePricing1794313802550 implements MigrationInterface {
  name = 'AddQuotePricing1794313802550';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "quotes" ADD "systemPrice" numeric(12,2) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "quotes" ADD "principalAmount" numeric(12,2) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "quotes" ADD "riskBand" character varying(1) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "quotes" ADD "apr" numeric(4,2) NOT NULL`,
    );
    await queryRunner.query(`ALTER TABLE "quotes" ADD "offers" jsonb NOT NULL`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "quotes" DROP COLUMN "offers"`);
    await queryRunner.query(`ALTER TABLE "quotes" DROP COLUMN "apr"`);
    await queryRunner.query(`ALTER TABLE "quotes" DROP COLUMN "riskBand"`);
    await queryRunner.query(
      `ALTER TABLE "quotes" DROP COLUMN "principalAmount"`,
    );
    await queryRunner.query(`ALTER TABLE "quotes" DROP COLUMN "systemPrice"`);
  }
}
