import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { DataSource } from 'typeorm';
import { AppModule } from '../src/app.module';
import { configureApp } from '../src/app.setup';

export type Agent = ReturnType<typeof request.agent>;

export const ADMIN = { email: 'admin@test.com', password: 'pass@test' };

export const validQuote = {
  fullName: 'Jane Doe',
  email: 'jane@example.com',
  address: 'Hauptstraße 1, 10115 Berlin',
  monthlyConsumptionKwh: 450,
  systemSizeKw: 5,
  downPayment: 1000,
};

export async function createTestApp(): Promise<INestApplication> {
  const moduleRef = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();
  const app = moduleRef.createNestApplication({ logger: false });
  configureApp(app);
  await app.init();
  return app;
}

export async function resetDatabase(app: INestApplication): Promise<void> {
  const dataSource = app.get(DataSource);
  await dataSource.query('DELETE FROM quotes');
  await dataSource.query('DELETE FROM users WHERE email <> $1', [ADMIN.email]);
}

export async function signUp(
  app: INestApplication,
  email: string,
  fullName = 'Test User',
): Promise<Agent> {
  const agent = request.agent(app.getHttpServer());
  await agent
    .post('/api/auth/signup')
    .send({ fullName, email, password: 'correct-horse-battery' })
    .expect(201);
  return agent;
}

export async function signInAsAdmin(app: INestApplication): Promise<Agent> {
  const agent = request.agent(app.getHttpServer());
  await agent.post('/api/auth/signin').send(ADMIN).expect(200);
  return agent;
}
