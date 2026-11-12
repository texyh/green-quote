import 'reflect-metadata';
import { validateEnv } from './env.validation';

describe('validateEnv', () => {
  const valid = {
    DATABASE_URL: 'postgres://localhost/green_quote',
    JWT_SECRET: 'secret',
    SESSION_TTL_SECONDS: '3600',
    PRICE_PER_KW_EUR: '1200',
  };

  it('accepts a valid config and converts numbers', () => {
    expect(validateEnv(valid)).toMatchObject({
      SESSION_TTL_SECONDS: 3600,
      PRICE_PER_KW_EUR: 1200,
    });
  });

  it('keeps variables it does not validate', () => {
    expect(validateEnv({ ...valid, LOG_LEVEL: 'debug' })).toMatchObject({
      LOG_LEVEL: 'debug',
    });
  });

  it.each([
    ['a missing JWT_SECRET', { JWT_SECRET: undefined }],
    ['a non-numeric price', { PRICE_PER_KW_EUR: 'abc' }],
    ['a negative price', { PRICE_PER_KW_EUR: '-1' }],
    ['a decimal session length', { SESSION_TTL_SECONDS: '1.5' }],
    ['a non-numeric port', { PORT: 'http' }],
  ])('rejects %s', (_, override) => {
    expect(() => validateEnv({ ...valid, ...override })).toThrow();
  });
});
