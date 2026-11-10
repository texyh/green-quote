import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { AuthUser } from '../auth/jwt-auth.guard';
import { User } from '../users/user.entity';
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
  ) {}

  async create(dto: CreateQuoteDto, userId: string): Promise<QuoteResponseDto> {
    const quote = this.quotesRepository.create(dto);
    quote.user = { id: userId } as User;
    const saved = await this.quotesRepository.save(quote);
    return QuoteResponseDto.fromEntity(saved);
  }

  async findOneForUser(id: string, user: AuthUser): Promise<QuoteResponseDto> {
    const quote = await this.quotesRepository.findOneBy(
      user.role === 'admin' ? { id } : { id, user: { id: user.id } },
    );
    if (!quote) throw new NotFoundException('Quote not found');
    return QuoteResponseDto.fromEntity(quote);
  }

  async findAllForUser(
    userId: string,
    { page, limit }: ListQuotesQueryDto,
  ): Promise<QuoteListResponseDto> {
    const [quotes, total] = await this.quotesRepository.findAndCount({
      where: { user: { id: userId } },
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
