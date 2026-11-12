import { INestApplication } from '@nestjs/common';
import {
  createTestApp,
  resetDatabase,
  signInAsAdmin,
  signUp,
  validQuote,
} from './helpers';

describe('Admin (integration)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await createTestApp();
  });

  beforeEach(() => resetDatabase(app));

  afterAll(() => app.close());

  it('forbids regular users from the admin list', async () => {
    const jane = await signUp(app, 'jane@example.com');

    await jane.get('/api/admin/quotes').expect(403);
  });

  it('lets the seeded admin list all quotes and search by owner', async () => {
    const jane = await signUp(app, 'jane@example.com', 'Jane Doe');
    const bob = await signUp(app, 'bob@example.com', 'Bob Smith');
    await jane.post('/api/quotes').send(validQuote);
    await bob.post('/api/quotes').send(validQuote);
    const admin = await signInAsAdmin(app);

    const all = await admin.get('/api/admin/quotes').expect(200);
    expect(all.body.total).toBe(2);

    const byEmail = await admin
      .get('/api/admin/quotes?search=BOB@')
      .expect(200);
    expect(byEmail.body.total).toBe(1);

    const byName = await admin.get('/api/admin/quotes?search=jane').expect(200);
    expect(byName.body.total).toBe(1);
  });

  it("lets the admin open another user's quote", async () => {
    const jane = await signUp(app, 'jane@example.com');
    const created = await jane.post('/api/quotes').send(validQuote);
    const admin = await signInAsAdmin(app);

    await admin.get(`/api/quotes/${created.body.id as string}`).expect(200);
  });
});
