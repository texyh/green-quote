import { Quote } from '../quote.entity';
import { QuoteResponseDto } from './quote-response.dto';

describe('QuoteResponseDto.fromEntity', () => {
  it('maps the entity and converts numeric columns from strings to numbers', () => {
    const createdAt = new Date('2026-01-01T00:00:00Z');
    const offers = [
      { termYears: 5, apr: 6.9, principalUsed: 6600, monthlyPayment: 130.38 },
    ];
    const quote = Object.assign(new Quote(), {
      id: 'b3f1c2d4-0000-4000-8000-000000000000',
      fullName: 'Jane Doe',
      email: 'jane@example.com',
      address: 'Hauptstraße 1, 10115 Berlin',
      monthlyConsumptionKwh: '450',
      systemSizeKw: '5.5',
      downPayment: '0',
      systemPrice: '6600.00',
      principalAmount: '6600.00',
      riskBand: 'A',
      apr: '6.90',
      offers,
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
      systemPrice: 6600,
      principalAmount: 6600,
      riskBand: 'A',
      apr: 6.9,
      offers,
      createdAt,
    });
  });
});
