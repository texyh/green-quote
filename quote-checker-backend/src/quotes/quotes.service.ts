import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, ILike, Repository } from 'typeorm';
import type { AuthUser } from '../auth/guards/jwt-auth.guard';
import { PricingService } from '../pricing/pricing.service';
import { User } from '../users/user.entity';
import { AdminListQuotesQueryDto } from './dto/admin-list-quotes-query.dto';
import { CreateQuoteDto } from './dto/create-quote.dto';
import { ListQuotesQueryDto } from './dto/list-quotes-query.dto';
import { QuoteListResponseDto } from './dto/quote-list-response.dto';
import { QuoteResponseDto } from './dto/quote-response.dto';
import { Quote } from './quote.entity';

@Injectable()
export class QuotesService {
  constructor(
    @InjectRepository(Quote)
    private readonly quotesRepository: Repository<Quote>,
    private readonly pricingService: PricingService,
  ) {}

  async create(dto: CreateQuoteDto, userId: string): Promise<QuoteResponseDto> {
    const pricing = this.pricingService.calculate(dto);

    const quote = this.quotesRepository.create(dto);
    quote.user = { id: userId } as User;
    quote.systemPrice = pricing.systemPrice;
    quote.principalAmount = pricing.principalAmount;
    quote.riskBand = pricing.riskBand;
    quote.apr = pricing.apr;
    quote.offers = pricing.offers;
    const saved = await this.quotesRepository.save(quote);
    return QuoteResponseDto.fromEntity(saved);
  }

  async findOneForUser(id: string, user: AuthUser): Promise<QuoteResponseDto> {
    const quote = await this.quotesRepository.findOneBy(
      user.role === 'admin' ? { id } : { id, user: { id: user.id } },
    );

    if (!quote) {
      throw new NotFoundException('Quote not found');
    }
    return QuoteResponseDto.fromEntity(quote);
  }

  findAllForUser(
    userId: string,
    query: ListQuotesQueryDto,
  ): Promise<QuoteListResponseDto> {
    return this.paginate({ user: { id: userId } }, query);
  }

  findAll({
    search,
    ...query
  }: AdminListQuotesQueryDto): Promise<QuoteListResponseDto> {
    const where: FindOptionsWhere<Quote>[] = search
      ? [
          { user: { fullName: ILike(`%${search}%`) } },
          { user: { email: ILike(`%${search}%`) } },
        ]
      : [{}];
    return this.paginate(where, query);
  }

  private async paginate(
    where: FindOptionsWhere<Quote> | FindOptionsWhere<Quote>[],
    { page, limit }: ListQuotesQueryDto,
  ): Promise<QuoteListResponseDto> {
    const [quotes, total] = await this.quotesRepository.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return {
      items: quotes.map((quote) => QuoteResponseDto.fromEntity(quote)),
      total,
      page,
      limit,
    };
  }
}
