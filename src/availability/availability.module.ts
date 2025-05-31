import { Module } from '@nestjs/common';
import { AvailabilityService } from './availability.service';
import { TransactionSourceModule } from 'src/transaction-source/transaction-source.module';

@Module({
  imports: [TransactionSourceModule],
  providers: [AvailabilityService],
  exports: [AvailabilityService],
})
export class AvailabilityModule {}
