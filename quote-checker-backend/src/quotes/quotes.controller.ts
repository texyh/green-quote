import {
  Body,
  Controller,
  Get,
  Logger,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiCookieAuth,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CurrentUser } from '../auth/current-user.decorator';
import type { AuthUser } from '../auth/jwt-auth.guard';
import { CreateQuoteDto } from './dto/create-quote.dto';
import { ListQuotesQueryDto } from './dto/list-quotes-query.dto';
import { QuoteListResponseDto } from './dto/quote-list-response.dto';
import { QuoteResponseDto } from './dto/quote-response.dto';
import { QuotesService } from './quotes.service';

@ApiTags('quotes')
@ApiCookieAuth()
@ApiUnauthorizedResponse({ description: 'Not signed in' })
@Controller('quotes')
export class QuotesController {
  private readonly logger = new Logger(QuotesController.name);

  constructor(private readonly quotesService: QuotesService) {}

  @Get()
  @ApiOkResponse({ type: QuoteListResponseDto })
  @ApiBadRequestResponse({ description: 'Invalid page or limit' })
  findMine(
    @Query() query: ListQuotesQueryDto,
    @CurrentUser() user: AuthUser,
  ): Promise<QuoteListResponseDto> {
    this.logger.log('GET /api/quotes', {
      userId: user.id,
      page: query.page,
      limit: query.limit,
    });
    return this.quotesService.findAllForUser(user.id, query);
  }

  @Get(':id')
  @ApiOkResponse({ type: QuoteResponseDto })
  @ApiBadRequestResponse({ description: 'id is not a UUID' })
  @ApiNotFoundResponse({ description: 'Quote not found or not yours' })
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthUser,
  ): Promise<QuoteResponseDto> {
    this.logger.log('GET /api/quotes/:id', { userId: user.id, quoteId: id });
    return this.quotesService.findOneForUser(id, user);
  }

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
