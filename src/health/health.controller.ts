import { Controller, Get } from '@nestjs/common';
import { Public } from 'src/auth/auth.decorator';

@Controller('health')
@Public()
export class HealthController {
  @Get()
  ping() {
    return { status: 'ok', ts: new Date().toISOString() };
  }
}
