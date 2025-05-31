import { Module } from '@nestjs/common';
import { HealthModule } from './health/health.module';
import { HealthController } from './health/health.controller';
import { DatabaseModule } from './common/database/database.module';
import { AvailabilityModule } from './availability/availability.module';
import { TransactionService } from './transaction-source/transaction-source.service';
import { TransactionSourceModule } from './transaction-source/transaction-source.module';
import { ConfigModule } from '@nestjs/config';
import { EnvValidationSchema } from './common/config/env-validation.config';

@Module({
  imports: [
    DatabaseModule,
    AvailabilityModule,
    TransactionSourceModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      validationSchema: EnvValidationSchema
    }),
    HealthModule
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
