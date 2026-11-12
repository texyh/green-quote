export const TEST_DATABASE_URL =
  process.env.TEST_DATABASE_URL ??
  'postgres://postgres:postgres@localhost:5433/green_quote_test';

process.env.DATABASE_URL = TEST_DATABASE_URL;
process.env.JWT_SECRET = 'integration-test-secret';
process.env.LOG_LEVEL = 'error';
