import { INestApplication } from '@nestjs/common';
import { createTestApp, resetDatabase, signUp, validQuote } from './helpers';

describe('Quotes (integration)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await createTestApp();
  });

  beforeEach(() => resetDatabase(app));

  afterAll(() => app.close());

  it('creates a quote and returns the inputs, pricing and offers', async () => {
    const agent = await signUp(app, 'jane@example.com');

    const res = await agent.post('/api/quotes').send(validQuote).expect(201);

    expect(res.body).toMatchObject({
      id: expect.any(String),
      address: validQuote.address,
      monthlyConsumptionKwh: 450,
      systemSizeKw: 5,
      downPayment: 1000,
      systemPrice: 6000,
      principalAmount: 5000,
      riskBand: 'A',
      apr: 6.9,
    });
    expect(res.body.offers).toEqual([
      { termYears: 5, apr: 6.9, principalUsed: 5000, monthlyPayment: 98.77 },
      { termYears: 10, apr: 6.9, principalUsed: 5000, monthlyPayment: 57.8 },
      { termYears: 15, apr: 6.9, principalUsed: 5000, monthlyPayment: 44.66 },
    ]);
  });

  it('rejects an invalid body and a down payment above the price', async () => {
    const agent = await signUp(app, 'jane@example.com');

    await agent
      .post('/api/quotes')
      .send({ ...validQuote, systemSizeKw: 0 })
      .expect(400);

    const res = await agent
      .post('/api/quotes')
      .send({ ...validQuote, downPayment: 6000.01 })
      .expect(400);
    expect(res.body.field).toBe('downPayment');
  });

  it("lists only the signed-in user's quotes, newest first and paginated", async () => {
    const jane = await signUp(app, 'jane@example.com');
    const bob = await signUp(app, 'bob@example.com');

    await jane.post('/api/quotes').send({ ...validQuote, systemSizeKw: 4 });
    await jane.post('/api/quotes').send({ ...validQuote, systemSizeKw: 5 });
    await bob.post('/api/quotes').send(validQuote);

    const page1 = await jane.get('/api/quotes?page=1&limit=1').expect(200);
    expect(page1.body).toMatchObject({ total: 2, page: 1, limit: 1 });
    expect(page1.body.items).toHaveLength(1);
    expect(page1.body.items[0].systemSizeKw).toBe(5);

    const page2 = await jane.get('/api/quotes?page=2&limit=1').expect(200);
    expect(page2.body.items[0].systemSizeKw).toBe(4);
  });

  it('returns a quote to its owner and 404 to anyone else', async () => {
    const jane = await signUp(app, 'jane@example.com');
    const bob = await signUp(app, 'bob@example.com');
    const created = await jane.post('/api/quotes').send(validQuote);
    const id = created.body.id as string;

    await jane.get(`/api/quotes/${id}`).expect(200);
    await bob.get(`/api/quotes/${id}`).expect(404);
    await jane.get('/api/quotes/not-a-uuid').expect(400);
  });
});
