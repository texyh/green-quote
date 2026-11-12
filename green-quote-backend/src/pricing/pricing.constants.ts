export type RiskBand = 'A' | 'B' | 'C';

export const APR_BY_BAND: Record<RiskBand, number> = {
  A: 6.9,
  B: 8.9,
  C: 11.9,
};
export const OFFER_TERMS_YEARS = [5, 10, 15];
