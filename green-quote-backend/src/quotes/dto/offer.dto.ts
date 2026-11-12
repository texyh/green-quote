import { ApiProperty } from '@nestjs/swagger';

export class OfferDto {
  @ApiProperty({ example: 10 })
  termYears: number;

  @ApiProperty({ example: 6.9 })
  apr: number;

  @ApiProperty({ example: 5000 })
  principalUsed: number;

  @ApiProperty({ example: 57.8 })
  monthlyPayment: number;
}
