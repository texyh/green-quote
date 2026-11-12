import { Module } from '@nestjs/common';
import { OfferingService } from './offering.service';
import { PricingService } from './pricing.service';

@Module({
  providers: [PricingService, OfferingService],
  exports: [PricingService],
})
export class PricingModule {}
