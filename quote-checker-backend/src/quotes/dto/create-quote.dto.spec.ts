import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { CreateQuoteDto } from './create-quote.dto';

describe('CreateQuoteDto validation', () => {
  const pipe = new ValidationPipe({ whitelist: true });
  const validate = (body: object) =>
    pipe.transform(body, { type: 'body', metatype: CreateQuoteDto });

  const validBody = {
    fullName: 'Jane Doe',
    email: 'jane@example.com',
    address: 'Hauptstraße 1, 10115 Berlin',
    monthlyConsumptionKwh: 450,
    systemSizeKw: 5,
  };

  it('accepts a valid body without a down payment', async () => {
    await expect(validate(validBody)).resolves.toMatchObject(validBody);
  });

  it('strips fields that are not in the DTO', async () => {
    const result = await validate({ ...validBody, id: 'hacked' });
    expect(result).not.toHaveProperty('id');
  });

  it.each([
    ['missing fullName', { ...validBody, fullName: undefined }],
    ['invalid email', { ...validBody, email: 'not-an-email' }],
    ['empty address', { ...validBody, address: '' }],
    ['negative consumption', { ...validBody, monthlyConsumptionKwh: -1 }],
    ['zero system size', { ...validBody, systemSizeKw: 0 }],
    ['system size as string', { ...validBody, systemSizeKw: '5' }],
    ['negative down payment', { ...validBody, downPayment: -100 }],
  ])('rejects %s', async (_, body) => {
    await expect(validate(body)).rejects.toBeInstanceOf(BadRequestException);
  });
});
