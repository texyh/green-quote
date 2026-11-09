import { ApiProperty } from '@nestjs/swagger';
import { Quote } from '../quote.entity';

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
      createdAt: quote.createdAt,
    };
  }
}
