import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Offer, OfferingService } from './offering.service';
import { APR_BY_BAND, OFFER_TERMS_YEARS, RiskBand } from './pricing.constants';

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
  private readonly pricePerKwEur: number;

  constructor(
    private readonly offeringService: OfferingService,
    config: ConfigService,
  ) {
    this.pricePerKwEur = config.getOrThrow<number>('PRICE_PER_KW_EUR');
  }

  calculate({
    systemSizeKw,
    monthlyConsumptionKwh,
    downPayment = 0,
  }: PricingInput): PricingResult {
    const systemPrice = this.calculateSystemPrice(
      systemSizeKw,
      this.pricePerKwEur,
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
