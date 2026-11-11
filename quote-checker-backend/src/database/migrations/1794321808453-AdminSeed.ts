import { MigrationInterface, QueryRunner } from 'typeorm';

export class AdminSeed1794321808453 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `INSERT INTO public.users
      (id, "fullName", email, "passwordHash", "role", "createdAt") VALUES
      (uuid_generate_v4(), 'admin test', 'admin@test.com', 'bad2df1d21060b7568c403b5fe787452:bf267593e75217f9a53ddeacbdcd8f8f636e1e14c12934c5352de62851527f202a5fd5e929ffd8d18dc8637c4bcd797da7c75a2af7f69025f2332872a51e5bc1', 'admin', now())
      ON CONFLICT (email) DO NOTHING`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DELETE FROM public.users WHERE email='admin@test.com'`,
    );
  }
}
