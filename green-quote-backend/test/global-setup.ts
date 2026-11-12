import { execSync } from 'node:child_process';
import { DataSource } from 'typeorm';
import { TEST_DATABASE_URL } from './test-env';

export default async function globalSetup(): Promise<void> {
  const url = new URL(TEST_DATABASE_URL);
  const databaseName = url.pathname.slice(1);
  url.pathname = '/postgres';

  const dataSource = new DataSource({ type: 'postgres', url: url.toString() });
  await dataSource.initialize();
  const existing: unknown[] = await dataSource.query(
    'SELECT 1 FROM pg_database WHERE datname = $1',
    [databaseName],
  );
  if (existing.length === 0) {
    await dataSource.query(`CREATE DATABASE "${databaseName}"`);
  }
  await dataSource.destroy();

  execSync(
    './node_modules/.bin/nest build && node node_modules/typeorm/cli.js -d dist/database/data-source.js migration:run && node dist/database/seed-admin.js',
    {
      stdio: 'ignore',
      env: { ...process.env, DATABASE_URL: TEST_DATABASE_URL },
    },
  );
}
