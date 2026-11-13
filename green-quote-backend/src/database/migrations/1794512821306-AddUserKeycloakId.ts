import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUserKeycloakId1794512821306 implements MigrationInterface {
  name = 'AddUserKeycloakId1794512821306';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" ADD "keycloakId" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD CONSTRAINT "UQ_7c4efc5ecbdbcb378b7a43fa011" UNIQUE ("keycloakId")`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "passwordHash" DROP NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "passwordHash" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" DROP CONSTRAINT "UQ_7c4efc5ecbdbcb378b7a43fa011"`,
    );
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "keycloakId"`);
  }
}
