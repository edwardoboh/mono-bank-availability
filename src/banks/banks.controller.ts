import { Controller, Get, Param, Query } from '@nestjs/common';
import { BanksService } from './banks.service';
import { AvailabilityQueryDto } from './dto/availability-query.dto';

@Controller('banks')
export class BanksController {
    constructor(
        private readonly banksService: BanksService) {}

    @Get('availability')
    async getAll(@Query() query: AvailabilityQueryDto) {
        const window = query.window || '1h';
        const data = await this.banksService.getAll(window);
        return { data, requested_window: window };
    }

    @Get(':bankCode/availability')
    async getOne(
        @Param('bankCode') bankCode: string,
        @Query() query: AvailabilityQueryDto,
    ) {
        const timeWindow = query.window || '1h';
        const data = await this.banksService.getOne(bankCode, timeWindow);
        return { data, requested_window: timeWindow };
    }
}
