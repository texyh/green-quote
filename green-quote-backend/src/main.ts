import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { configureApp } from './app.setup';
import { ACCESS_TOKEN_COOKIE } from './auth/auth.constants';
import { logger } from './common/logger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { logger });
  configureApp(app);

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
