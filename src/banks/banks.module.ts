import { Module } from '@nestjs/common';
import { BanksController } from './banks.controller';
import { BanksService } from './banks.service';
import { AvailabilityModule } from 'src/availability/availability.module';

@Module({
  imports: [AvailabilityModule],
  controllers: [BanksController],
  providers: [BanksService]
})
export class BanksModule {}
