import { Module } from '@nestjs/common';
import { HealthModule } from './health/health.module';
import { HealthController } from './health/health.controller';
import { DatabaseModule } from './common/database/database.module';
import { AvailabilityModule } from './availability/availability.module';
import { TransactionService } from './transaction-source/transaction-source.service';
import { TransactionSourceModule } from './transaction-source/transaction-source.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EnvValidationSchema } from './common/config/env-validation.config';
import { BanksModule } from './banks/banks.module';
import { ScheduleModule } from '@nestjs/schedule';
import Configs from './common/config/configuration';
import { AuthGuard } from './auth/auth.guard';
import { CacheInterceptor, CacheModule } from '@nestjs/cache-manager';
import { createKeyv } from '@keyv/redis';

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
    CacheModule.registerAsync({
      useFactory: async (configService: ConfigService) => {
        const REDIS_URL = configService.get<string>('redisUrl');
        return {
          ttl: 2 * 60 * 1000,  // Here, I am using a TTL <= 5seconds (the shortest poll frequency).
          stores: [createKeyv(REDIS_URL)],
        };
      },
      isGlobal: true,
      inject: [ConfigService]
    }),
  ],
  controllers: [
    HealthController
  ],
  providers: [
    HealthModule,
    TransactionService,
    {
      provide: 'APP_GUARD',
      useClass: AuthGuard,
    },
    {
      provide: 'APP_INTERCEPTOR',
      useClass: CacheInterceptor,
    }
  ]
})
export class AppModule {}
