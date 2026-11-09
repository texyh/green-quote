import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddQuoteUser1794250806462 implements MigrationInterface {
  name = 'AddQuoteUser1794250806462';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "quotes" ADD "userId" uuid NOT NULL`);
    await queryRunner.query(
      `CREATE INDEX "IDX_8bad8bd49d1dd6954b46366349" ON "quotes"  ("userId") `,
    );
    await queryRunner.query(
      `ALTER TABLE "quotes" ADD CONSTRAINT "FK_8bad8bd49d1dd6954b46366349c" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "quotes" DROP CONSTRAINT "FK_8bad8bd49d1dd6954b46366349c"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_8bad8bd49d1dd6954b46366349"`,
    );
    await queryRunner.query(`ALTER TABLE "quotes" DROP COLUMN "userId"`);
  }
}
