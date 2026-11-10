import { ApiProperty } from '@nestjs/swagger';
import { QuoteResponseDto } from './quote-response.dto';

export class QuoteListResponseDto {
  @ApiProperty({ type: [QuoteResponseDto] })
  items: QuoteResponseDto[];

  @ApiProperty({ example: 42 })
  total: number;

  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 10 })
  limit: number;
}
