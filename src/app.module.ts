import { Module } from '@nestjs/common';
import { HealthModule } from './health/health.module';
import { HealthController } from './health/health.controller';
import { DatabaseModule } from './database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [
    HealthController
  ],
  providers: [
    HealthModule
  ],
})
export class AppModule {}
