import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Min,
} from 'class-validator';

export class CreateQuoteDto {
  @ApiProperty({ example: 'Jane Doe' })
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @ApiProperty({ example: 'jane@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'Hauptstraße 1, 10115 Berlin' })
  @IsString()
  @IsNotEmpty()
  address: string;

  @ApiProperty({ example: 450 })
  @IsNumber()
  @Min(0)
  monthlyConsumptionKwh: number;

  @ApiProperty({ example: 5 })
  @IsNumber()
  @IsPositive()
  systemSizeKw: number;

  @ApiPropertyOptional({ example: 1000 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  downPayment?: number;
}
