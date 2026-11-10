import { NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Quote } from './quote.entity';
import { QuotesService } from './quotes.service';

describe('QuotesService', () => {
  const findAndCount = jest.fn();
  const findOneBy = jest.fn();
  const service = new QuotesService({
    findAndCount,
    findOneBy,
  } as unknown as Repository<Quote>);

  const quote = Object.assign(new Quote(), {
    id: 'quote-1',
    fullName: 'Jane Doe',
    email: 'jane@example.com',
    address: 'Hauptstraße 1, 10115 Berlin',
    monthlyConsumptionKwh: '450',
    systemSizeKw: '5',
    downPayment: '0',
    createdAt: new Date('2026-01-01T00:00:00Z'),
  });

  beforeEach(() => jest.clearAllMocks());

  describe('findAllForUser', () => {
    it("returns one page of the user's quotes, newest first", async () => {
      findAndCount.mockResolvedValue([[quote], 21]);

      const result = await service.findAllForUser('user-1', {
        page: 3,
        limit: 10,
      });

      expect(findAndCount).toHaveBeenCalledWith({
        where: { user: { id: 'user-1' } },
        order: { createdAt: 'DESC' },
        skip: 20,
        take: 10,
      });
      expect(result).toEqual({
        items: [expect.objectContaining({ id: 'quote-1', systemSizeKw: 5 })],
        total: 21,
        page: 3,
        limit: 10,
      });
    });
  });

  describe('findOneForUser', () => {
    it('looks the quote up scoped to its owner', async () => {
      findOneBy.mockResolvedValue(quote);

      const result = await service.findOneForUser('quote-1', {
        id: 'user-1',
        role: 'user',
      });

      expect(findOneBy).toHaveBeenCalledWith({
        id: 'quote-1',
        user: { id: 'user-1' },
      });
      expect(result).toMatchObject({ id: 'quote-1', systemSizeKw: 5 });
    });

    it("returns 404 for someone else's quote", async () => {
      findOneBy.mockResolvedValue(null);
      await expect(
        service.findOneForUser('quote-1', { id: 'user-2', role: 'user' }),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('lets an admin read any quote', async () => {
      findOneBy.mockResolvedValue(quote);
      await service.findOneForUser('quote-1', { id: 'admin-1', role: 'admin' });
      expect(findOneBy).toHaveBeenCalledWith({ id: 'quote-1' });
    });
  });
});
