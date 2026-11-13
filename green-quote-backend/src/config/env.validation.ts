import { plainToInstance } from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  IsUrl,
  validateSync,
} from 'class-validator';

const URL_OPTIONS = { require_tld: false, require_protocol: true };

class EnvironmentVariables {
  @IsString()
  @IsNotEmpty()
  DATABASE_URL: string;

  @IsString()
  @IsNotEmpty()
  JWT_SECRET: string;

  @IsInt()
  @IsPositive()
  SESSION_TTL_SECONDS: number;

  @IsNumber()
  @IsPositive()
  PRICE_PER_KW_EUR: number;

  @IsOptional()
  @IsInt()
  @IsPositive()
  PORT?: number;

  @IsUrl(URL_OPTIONS)
  APP_URL: string;

  @IsUrl(URL_OPTIONS)
  KEYCLOAK_URL: string;

  @IsOptional()
  @IsUrl(URL_OPTIONS)
  KEYCLOAK_INTERNAL_URL?: string;

  @IsString()
  @IsNotEmpty()
  KEYCLOAK_CLIENT_ID: string;

  @IsString()
  @IsNotEmpty()
  KEYCLOAK_CLIENT_SECRET: string;
}

export function validateEnv(
  config: Record<string, unknown>,
): EnvironmentVariables {
  const env = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });
  const errors = validateSync(env);

  if (errors.length > 0) {
    throw new Error(errors.toString());
  }
  return env;
}
