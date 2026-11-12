import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { ListQuotesQueryDto } from './list-quotes-query.dto';

export class AdminListQuotesQueryDto extends ListQuotesQueryDto {
  @ApiPropertyOptional({ description: 'Matches the owner name or email' })
  @IsOptional()
  @IsString()
  search?: string;
}
