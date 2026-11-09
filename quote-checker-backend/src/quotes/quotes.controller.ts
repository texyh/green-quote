import { Body, Controller, Logger, Post } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CreateQuoteDto } from './dto/create-quote.dto';
import { QuoteResponseDto } from './dto/quote-response.dto';
import { QuotesService } from './quotes.service';

@ApiTags('quotes')
@Controller('quotes')
export class QuotesController {
  private readonly logger = new Logger(QuotesController.name);

  constructor(private readonly quotesService: QuotesService) {}

  @Post()
  @ApiCreatedResponse({ type: QuoteResponseDto })
  @ApiBadRequestResponse({ description: 'Invalid request body' })
  async create(@Body() dto: CreateQuoteDto): Promise<QuoteResponseDto> {
    this.logger.log('POST /api/quotes', {
      monthlyConsumptionKwh: dto.monthlyConsumptionKwh,
      systemSizeKw: dto.systemSizeKw,
      downPayment: dto.downPayment,
    });
    const quote = await this.quotesService.create(dto);
    this.logger.log('POST /api/quotes created', { quoteId: quote.id });
    return quote;
  }
}
