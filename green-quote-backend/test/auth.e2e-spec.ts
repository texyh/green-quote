import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createTestApp, resetDatabase, signUp } from './helpers';

describe('Auth (integration)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await createTestApp();
  });

  beforeEach(() => resetDatabase(app));

  afterAll(() => app.close());

  it('signs up, sets an httpOnly session cookie and returns the user without the password', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/auth/signup')
      .send({
        fullName: 'Jane Doe',
        email: 'Jane@Example.com',
        password: 'correct-horse-battery',
      })
      .expect(201);

    expect(res.body).toEqual({
      id: expect.any(String),
      fullName: 'Jane Doe',
      email: 'jane@example.com',
      role: 'user',
    });
    expect(res.headers['set-cookie']?.[0]).toMatch(
      /^access_token=.+; .*HttpOnly/,
    );
  });

  it('rejects a second signup with the same email', async () => {
    await signUp(app, 'jane@example.com');

    await request(app.getHttpServer())
      .post('/api/auth/signup')
      .send({
        fullName: 'Someone Else',
        email: 'jane@example.com',
        password: 'another-password',
      })
      .expect(409);
  });

  it('signs in with the right password and rejects a wrong one', async () => {
    await signUp(app, 'jane@example.com');
    const server = app.getHttpServer();

    await request(server)
      .post('/api/auth/signin')
      .send({ email: 'jane@example.com', password: 'correct-horse-battery' })
      .expect(200);
    await request(server)
      .post('/api/auth/signin')
      .send({ email: 'jane@example.com', password: 'wrong-password' })
      .expect(401);
  });

  it('returns the signed-in user and stops after sign-out', async () => {
    const agent = await signUp(app, 'jane@example.com', 'Jane Doe');

    const me = await agent.get('/api/auth/me').expect(200);
    expect(me.body).toMatchObject({ email: 'jane@example.com' });

    await agent.post('/api/auth/signout').expect(204);
    await agent.get('/api/auth/me').expect(401);
  });

  it('rejects protected routes without a session but keeps health public', async () => {
    const server = app.getHttpServer();

    await request(server).get('/api/quotes').expect(401);
    await request(server).get('/api/auth/me').expect(401);
    await request(server).get('/api/health').expect(200);
  });
});
