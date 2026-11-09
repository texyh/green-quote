import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateQuoteDto } from './dto/create-quote.dto';
import { QuoteResponseDto } from './dto/quote-response.dto';
import { Quote } from './quote.entity';

@Injectable()
export class QuotesService {
  constructor(
    @InjectRepository(Quote)
    private readonly quotesRepository: Repository<Quote>,
  ) {}

  async create(dto: CreateQuoteDto): Promise<QuoteResponseDto> {
    const quote = this.quotesRepository.create(dto);
    const saved = await this.quotesRepository.save(quote);
    return QuoteResponseDto.fromEntity(saved);
  }
}
