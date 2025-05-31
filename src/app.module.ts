import { Module } from '@nestjs/common';
import { HealthModule } from './health/health.module';
import { HealthController } from './health/health.controller';
import { DatabaseModule } from './common/database/database.module';
import { AvailabilityModule } from './availability/availability.module';
import { TransactionService } from './transaction-source/transaction-source.service';
import { TransactionSourceModule } from './transaction-source/transaction-source.module';
import { ConfigModule } from '@nestjs/config';
import { EnvValidationSchema } from './common/config/env-validation.config';
import { BanksModule } from './banks/banks.module';
import { ScheduleModule } from '@nestjs/schedule';
import Configs from './common/config/configuration';

@Module({
  imports: [
    DatabaseModule,
    AvailabilityModule,
    ScheduleModule.forRoot(),
    TransactionSourceModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      validationSchema: EnvValidationSchema,
      load: [Configs],
    }),
    HealthModule,
    BanksModule,
  ],
  controllers: [
    HealthController
  ],
  providers: [
    HealthModule,
    TransactionService
  ]
})
export class AppModule {}
