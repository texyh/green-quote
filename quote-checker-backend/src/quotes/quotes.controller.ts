import { Body, Controller, Logger, Post } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiCookieAuth,
  ApiCreatedResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CurrentUser } from '../auth/current-user.decorator';
import type { AuthUser } from '../auth/jwt-auth.guard';
import { CreateQuoteDto } from './dto/create-quote.dto';
import { QuoteResponseDto } from './dto/quote-response.dto';
import { QuotesService } from './quotes.service';

@ApiTags('quotes')
@ApiCookieAuth()
@ApiUnauthorizedResponse({ description: 'Not signed in' })
@Controller('quotes')
export class QuotesController {
  private readonly logger = new Logger(QuotesController.name);

  constructor(private readonly quotesService: QuotesService) {}

  @Post()
  @ApiCreatedResponse({ type: QuoteResponseDto })
  @ApiBadRequestResponse({ description: 'Invalid request body' })
  async create(
    @Body() dto: CreateQuoteDto,
    @CurrentUser() user: AuthUser,
  ): Promise<QuoteResponseDto> {
    this.logger.log('POST /api/quotes', {
      userId: user.id,
      monthlyConsumptionKwh: dto.monthlyConsumptionKwh,
      systemSizeKw: dto.systemSizeKw,
      downPayment: dto.downPayment,
    });
    const quote = await this.quotesService.create(dto, user.id);
    this.logger.log('POST /api/quotes created', { quoteId: quote.id });
    return quote;
  }
}
