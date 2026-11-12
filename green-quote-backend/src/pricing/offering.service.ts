import { Injectable } from '@nestjs/common';

export type Offer = {
  termYears: number;
  apr: number;
  principalUsed: number;
  monthlyPayment: number;
};

export type ScheduleRow = {
  month: number;
  payment: number;
  interest: number;
  principal: number;
  balance: number;
};

const cents = (amount: number) => Number(amount.toFixed(2));
const monthlyRate = (apr: number) => apr / 100 / 12;
const toMonths = (termYears: number) => termYears * 12;

@Injectable()
export class OfferingService {
  calculateOffers(
    principal: number,
    apr: number,
    termsYears: number[],
  ): Offer[] {
    return termsYears.map((termYears) => ({
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
    const rate = monthlyRate(apr);
    const months = toMonths(termYears);
    const monthlyPayment = (principal * rate) / (1 - (1 + rate) ** -months);

    return cents(monthlyPayment);
  }

  calculateSchedule(
    principal: number,
    apr: number,
    monthlyPayment: number,
    termYears: number,
  ): ScheduleRow[] {
    const rate = monthlyRate(apr);
    const months = toMonths(termYears);
    const rows: ScheduleRow[] = [];
    let balance = principal;

    for (let month = 1; month <= months; month++) {
      const interest = cents(balance * rate);
      const principalPaid =
        month === months ? balance : cents(monthlyPayment - interest);
      balance = cents(balance - principalPaid);
      rows.push({
        month,
        payment: cents(interest + principalPaid),
        interest,
        principal: principalPaid,
        balance,
      });
    }

    return rows;
  }
}
