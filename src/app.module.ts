import { Module } from '@nestjs/common';
import { HealthModule } from './health/health.module';
import { HealthController } from './health/health.controller';

@Module({
  imports: [],
  controllers: [
    HealthController
  ],
  providers: [
    HealthModule
  ],
})
export class AppModule {}
