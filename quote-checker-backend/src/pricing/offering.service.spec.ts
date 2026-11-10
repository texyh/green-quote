import { OfferingService } from './offering.service';

describe('OfferingService', () => {
  const service = new OfferingService();

  it.each([
    [10000, 6.9, 5, 197.54],
    [10000, 6.9, 10, 115.59],
    [10000, 6.9, 15, 89.32],
    [10000, 11.9, 15, 119.37],
  ])(
    'calculates the monthly payment for %d at %d%% over %d years',
    (principal, apr, termYears, expected) => {
      expect(service.calculateMonthlyPayment(principal, apr, termYears)).toBe(
        expected,
      );
    },
  );

  it('returns an offer for each of the 5, 10 and 15 year terms', () => {
    expect(service.calculateOffers(10000, 6.9)).toEqual([
      { termYears: 5, apr: 6.9, principalUsed: 10000, monthlyPayment: 197.54 },
      { termYears: 10, apr: 6.9, principalUsed: 10000, monthlyPayment: 115.59 },
      { termYears: 15, apr: 6.9, principalUsed: 10000, monthlyPayment: 89.32 },
    ]);
  });
});
