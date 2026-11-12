import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { AllExceptionsFilter } from './common/all-exceptions.filter';
import { validateEnv } from './config/env.validation';
import { dataSourceOptions } from './database/data-source';
import { HealthModule } from './health/health.module';
import { QuotesModule } from './quotes/quotes.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, validate: validateEnv }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        ...dataSourceOptions,
        url: config.getOrThrow<string>('DATABASE_URL'),
        autoLoadEntities: true,
      }),
    }),
    AuthModule,
    HealthModule,
    QuotesModule,
  ],
  providers: [{ provide: APP_FILTER, useClass: AllExceptionsFilter }],
})
export class AppModule {}
