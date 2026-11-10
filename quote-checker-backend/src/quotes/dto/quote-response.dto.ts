import { ApiProperty } from '@nestjs/swagger';
import type { RiskBand } from '../../pricing/pricing.constants';
import { Quote } from '../quote.entity';
import { OfferDto } from './offer.dto';

export class QuoteResponseDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty({ example: 'Jane Doe' })
  fullName: string;

  @ApiProperty({ example: 'jane@example.com' })
  email: string;

  @ApiProperty({ example: 'Hauptstraße 1, 10115 Berlin' })
  address: string;

  @ApiProperty({ example: 450 })
  monthlyConsumptionKwh: number;

  @ApiProperty({ example: 5 })
  systemSizeKw: number;

  @ApiProperty({ example: 1000 })
  downPayment: number;

  @ApiProperty({ example: 6000 })
  systemPrice: number;

  @ApiProperty({ example: 5000 })
  principalAmount: number;

  @ApiProperty({ enum: ['A', 'B', 'C'] })
  riskBand: RiskBand;

  @ApiProperty({ example: 6.9 })
  apr: number;

  @ApiProperty({ type: [OfferDto] })
  offers: OfferDto[];

  @ApiProperty()
  createdAt: Date;

  static fromEntity(quote: Quote): QuoteResponseDto {
    return {
      id: quote.id,
      fullName: quote.fullName,
      email: quote.email,
      address: quote.address,
      monthlyConsumptionKwh: Number(quote.monthlyConsumptionKwh),
      systemSizeKw: Number(quote.systemSizeKw),
      downPayment: Number(quote.downPayment),
      systemPrice: Number(quote.systemPrice),
      principalAmount: Number(quote.principalAmount),
      riskBand: quote.riskBand,
      apr: Number(quote.apr),
      offers: quote.offers,
      createdAt: quote.createdAt,
    };
  }
}
