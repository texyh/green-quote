import { Controller, Get, Logger, Query } from '@nestjs/common';
import {
  ApiCookieAuth,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { AuthUser } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { AdminListQuotesQueryDto } from './dto/admin-list-quotes-query.dto';
import { QuoteListResponseDto } from './dto/quote-list-response.dto';
import { QuotesService } from './quotes.service';

@ApiTags('admin')
@ApiCookieAuth()
@ApiUnauthorizedResponse({ description: 'Not signed in' })
@ApiForbiddenResponse({ description: 'Not an admin' })
@Roles('admin')
@Controller('admin/quotes')
export class AdminQuotesController {
  private readonly logger = new Logger(AdminQuotesController.name);

  constructor(private readonly quotesService: QuotesService) {}

  @Get()
  @ApiOkResponse({ type: QuoteListResponseDto })
  findAll(
    @Query() query: AdminListQuotesQueryDto,
    @CurrentUser() user: AuthUser,
  ): Promise<QuoteListResponseDto> {
    this.logger.log('GET /api/admin/quotes', {
      userId: user.id,
      page: query.page,
      limit: query.limit,
      hasSearch: Boolean(query.search),
    });
    return this.quotesService.findAll(query);
  }
}
