import { Injectable } from '@nestjs/common';
import { Offer, OfferingService } from './offering.service';
import {
  APR_BY_BAND,
  OFFER_TERMS_YEARS,
  PRICE_PER_KW_EUR,
  RiskBand,
} from './pricing.constants';

export type PricingInput = {
  systemSizeKw: number;
  monthlyConsumptionKwh: number;
  downPayment?: number;
};

export type PricingResult = {
  systemPrice: number;
  principalAmount: number;
  riskBand: RiskBand;
  apr: number;
  offers: Offer[];
};

@Injectable()
export class PricingService {
  constructor(private readonly offeringService: OfferingService) {}

  calculate({
    systemSizeKw,
    monthlyConsumptionKwh,
    downPayment = 0,
  }: PricingInput): PricingResult {
    const systemPrice = this.calculateSystemPrice(
      systemSizeKw,
      PRICE_PER_KW_EUR,
    );
    const principalAmount = systemPrice - downPayment;
    const riskBand = this.calculateRiskBand(
      systemSizeKw,
      monthlyConsumptionKwh,
    );
    const apr = this.calculateApr(riskBand, APR_BY_BAND);
    const offers = this.offeringService.calculateOffers(
      principalAmount,
      apr,
      OFFER_TERMS_YEARS,
    );

    return { systemPrice, principalAmount, riskBand, apr, offers };
  }

  calculateApr(
    riskBand: RiskBand,
    aprByBand: Record<RiskBand, number>,
  ): number {
    return aprByBand[riskBand];
  }

  calculateRiskBand(
    systemSizeKw: number,
    monthlyConsumptionKwh: number,
  ): RiskBand {
    if (monthlyConsumptionKwh >= 400 && systemSizeKw <= 6) {
      return 'A';
    }

    if (monthlyConsumptionKwh >= 250) {
      return 'B';
    }

    return 'C';
  }

  calculateSystemPrice(systemSizeKw: number, pricePerKw: number): number {
    return pricePerKw * systemSizeKw;
  }
}
