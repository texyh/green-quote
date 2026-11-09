import { Quote } from '../quote.entity';
import { QuoteResponseDto } from './quote-response.dto';

describe('QuoteResponseDto.fromEntity', () => {
  it('maps the entity and converts numeric columns from strings to numbers', () => {
    const createdAt = new Date('2026-01-01T00:00:00Z');
    const quote = Object.assign(new Quote(), {
      id: 'b3f1c2d4-0000-4000-8000-000000000000',
      fullName: 'Jane Doe',
      email: 'jane@example.com',
      address: 'Hauptstraße 1, 10115 Berlin',
      monthlyConsumptionKwh: '450',
      systemSizeKw: '5.5',
      downPayment: '0',
      createdAt,
    });

    expect(QuoteResponseDto.fromEntity(quote)).toEqual({
      id: 'b3f1c2d4-0000-4000-8000-000000000000',
      fullName: 'Jane Doe',
      email: 'jane@example.com',
      address: 'Hauptstraße 1, 10115 Berlin',
      monthlyConsumptionKwh: 450,
      systemSizeKw: 5.5,
      downPayment: 0,
      createdAt,
    });
  });
});
