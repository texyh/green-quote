import { hashPassword } from '../auth/password';
import dataSource from './data-source';

async function seedAdmin(): Promise<void> {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    throw new Error('ADMIN_EMAIL and ADMIN_PASSWORD must be set');
  }

  await dataSource.initialize();
  await dataSource.query(
    `INSERT INTO users ("fullName", email, "passwordHash", role)
     VALUES ('Admin', $1, $2, 'admin')
     ON CONFLICT (email)
     DO UPDATE SET "passwordHash" = EXCLUDED."passwordHash", role = 'admin'`,
    [email, await hashPassword(password)],
  );
  await dataSource.destroy();
  console.log(`Admin ${email} is ready`);
}

seedAdmin().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
