import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PricingModule } from '../pricing/pricing.module';
import { Quote } from './quote.entity';
import { AdminQuotesController } from './admin-quotes.controller';
import { QuotesController } from './quotes.controller';
import { QuotesService } from './quotes.service';

@Module({
  imports: [TypeOrmModule.forFeature([Quote]), PricingModule],
  controllers: [QuotesController, AdminQuotesController],
  providers: [QuotesService],
})
export class QuotesModule {}
