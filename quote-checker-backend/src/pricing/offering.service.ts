import { Injectable } from '@nestjs/common';
import { OFFER_TERMS_YEARS } from './pricing.constants';

export type Offer = {
  termYears: number;
  apr: number;
  principalUsed: number;
  monthlyPayment: number;
};

@Injectable()
export class OfferingService {
  calculateOffers(principal: number, apr: number): Offer[] {
    return OFFER_TERMS_YEARS.map((termYears) => ({
      termYears,
      apr,
      principalUsed: principal,
      monthlyPayment: this.calculateMonthlyPayment(principal, apr, termYears),
    }));
  }

  calculateMonthlyPayment(
    principal: number,
    apr: number,
    termYears: number,
  ): number {
    const r = apr / 100 / 12;
    const n = termYears * 12;
    const monthlyPayment = (principal * r) / (1 - (1 + r) ** -n);

    return Number(monthlyPayment.toFixed(2));
  }
}
