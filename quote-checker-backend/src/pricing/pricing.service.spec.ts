import { Test, TestingModule } from '@nestjs/testing';
import { OfferingService } from './offering.service';
import { PricingService } from './pricing.service';

describe('PricingService', () => {
  let service: PricingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PricingService, OfferingService],
    }).compile();

    service = module.get<PricingService>(PricingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should calculate system price', () => {
    const price = service.calculateSystemPrice(10);

    expect(price).toBe(12000);
  });

  it('calculates price, band, APR and offers, with down payment defaulting to 0', () => {
    const result = service.calculate({
      systemSizeKw: 5,
      monthlyConsumptionKwh: 450,
    });

    expect(result).toMatchObject({
      systemPrice: 6000,
      principalAmount: 6000,
      riskBand: 'A',
      apr: 6.9,
    });
    expect(result.offers.map((offer) => offer.termYears)).toEqual([5, 10, 15]);
  });

  it('subtracts the down payment from the principal', () => {
    const result = service.calculate({
      systemSizeKw: 5,
      monthlyConsumptionKwh: 450,
      downPayment: 1000,
    });

    expect(result.principalAmount).toBe(5000);
    expect(result.offers[0].principalUsed).toBe(5000);
  });
});
