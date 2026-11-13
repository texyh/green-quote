export const TEST_DATABASE_URL =
  process.env.TEST_DATABASE_URL ??
  'postgres://postgres:postgres@localhost:5433/green_quote_test';

export const ADMIN = { email: 'admin@test.com', password: 'pass@test' };

process.env.DATABASE_URL = TEST_DATABASE_URL;
process.env.JWT_SECRET = 'integration-test-secret';
process.env.LOG_LEVEL = 'error';
process.env.PRICE_PER_KW_EUR = '1200';
process.env.SESSION_TTL_SECONDS = '3600';
process.env.ADMIN_EMAIL = ADMIN.email;
process.env.ADMIN_PASSWORD = ADMIN.password;
process.env.APP_URL = 'http://localhost:3000';
process.env.KEYCLOAK_URL = 'http://localhost:8080/realms/green-quote';
process.env.KEYCLOAK_CLIENT_ID = 'green-quote-api';
process.env.KEYCLOAK_CLIENT_SECRET = 'integration-test-secret';
