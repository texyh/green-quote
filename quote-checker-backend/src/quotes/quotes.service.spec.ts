import { NotFoundException } from '@nestjs/common';
import { ILike, Repository } from 'typeorm';
import { OfferingService } from '../pricing/offering.service';
import { PricingService } from '../pricing/pricing.service';
import { Quote } from './quote.entity';
import { QuotesService } from './quotes.service';

describe('QuotesService', () => {
  const findAndCount = jest.fn();
  const findOneBy = jest.fn();
  const save = jest.fn((quote: Quote) =>
    Promise.resolve(
      Object.assign(quote, { id: 'quote-1', createdAt: new Date() }),
    ),
  );
  const service = new QuotesService(
    {
      findAndCount,
      findOneBy,
      save,
      create: (data: Partial<Quote>) => Object.assign(new Quote(), data),
    } as unknown as Repository<Quote>,
    new PricingService(new OfferingService()),
  );

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

  describe('create', () => {
    it('prices the quote and saves it under the signed-in user', async () => {
      const result = await service.create(
        {
          fullName: 'Jane Doe',
          email: 'jane@example.com',
          address: 'Hauptstraße 1, 10115 Berlin',
          monthlyConsumptionKwh: 450,
          systemSizeKw: 5,
          downPayment: 1000,
        },
        'user-1',
      );

      const saved = save.mock.calls[0][0];
      expect(saved.user).toEqual({ id: 'user-1' });
      expect(saved).toMatchObject({
        systemPrice: 6000,
        principalAmount: 5000,
        riskBand: 'A',
        apr: 6.9,
      });
      expect(saved.offers).toHaveLength(3);
      expect(result).toMatchObject({ id: 'quote-1', systemPrice: 6000 });
    });
  });

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

  describe('findAll (admin)', () => {
    it('returns all quotes when there is no search', async () => {
      findAndCount.mockResolvedValue([[quote], 1]);

      await service.findAll({ page: 2, limit: 5 });

      expect(findAndCount).toHaveBeenCalledWith({
        where: [{}],
        order: { createdAt: 'DESC' },
        skip: 5,
        take: 5,
      });
    });

    it("matches the search against the owner's name or email", async () => {
      findAndCount.mockResolvedValue([[quote], 1]);

      await service.findAll({ page: 1, limit: 10, search: 'jane' });

      expect(findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({
          where: [
            { user: { fullName: ILike('%jane%') } },
            { user: { email: ILike('%jane%') } },
          ],
        }),
      );
    });
  });
});
