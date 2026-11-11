import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { ACCESS_TOKEN_COOKIE } from './auth/auth.constants';
import { logger } from './common/logger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { logger });

  app.setGlobalPrefix('api');
  app.use(cookieParser());
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  const config = new DocumentBuilder()
    .setTitle('GreenQuote API')
    .setVersion('1.0')
    .addCookieAuth(ACCESS_TOKEN_COOKIE)
    .build();

  SwaggerModule.setup('api/docs', app, () =>
    SwaggerModule.createDocument(app, config),
  );

  const port = process.env.PORT ?? 3001;
  await app.listen(port);
  new Logger('Bootstrap').log({
    message: 'API listening',
    port: Number(port),
    docs: '/api/docs',
  });
}
void bootstrap();
