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
    expect(service.calculateOffers(10000, 6.9, [5, 10, 15])).toEqual([
      { termYears: 5, apr: 6.9, principalUsed: 10000, monthlyPayment: 197.54 },
      { termYears: 10, apr: 6.9, principalUsed: 10000, monthlyPayment: 115.59 },
      { termYears: 15, apr: 6.9, principalUsed: 10000, monthlyPayment: 89.32 },
    ]);
  });

  describe('calculateSchedule', () => {
    const rows = service.calculateSchedule(5000, 6.9, 98.77, 5);

    it('has one row per month', () => {
      expect(rows).toHaveLength(60);
      expect(rows.map((row) => row.month)).toEqual(
        Array.from({ length: 60 }, (_, i) => i + 1),
      );
    });

    it('splits each payment into interest on the balance and principal', () => {
      expect(rows.slice(0, 2)).toEqual([
        {
          month: 1,
          payment: 98.77,
          interest: 28.75,
          principal: 70.02,
          balance: 4929.98,
        },
        {
          month: 2,
          payment: 98.77,
          interest: 28.35,
          principal: 70.42,
          balance: 4859.56,
        },
      ]);
    });

    it('pays off exactly the principal, adjusting the last payment for rounding', () => {
      const totalPrincipal = rows.reduce((sum, row) => sum + row.principal, 0);
      const last = rows[rows.length - 1];

      expect(totalPrincipal).toBeCloseTo(5000, 2);
      expect(last.balance).toBe(0);
      expect(Math.abs(last.payment - 98.77)).toBeLessThan(1);
    });
  });
});
