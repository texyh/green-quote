import { plainToInstance } from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  validateSync,
} from 'class-validator';

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
