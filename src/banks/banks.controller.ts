import { Controller, Get, HttpCode, Param, Query, UseInterceptors } from '@nestjs/common';
import { BanksService } from './banks.service';
import { AvailabilityQueryDto } from './dto/availability-query.dto';
import { HttpStatus } from '@nestjs/common';
import { CacheInterceptor } from '@nestjs/cache-manager';

@Controller('banks')
@UseInterceptors(CacheInterceptor)
export class BanksController {
    constructor(
        private readonly banksService: BanksService) {}

    @Get('availability')
    @HttpCode(HttpStatus.OK)
    async getAll(@Query() query: AvailabilityQueryDto) {
        const window = query.window || '1h';
        const data = await this.banksService.getAll(window);
        return { data, requested_window: window };
    }

    @Get(':bankCode/availability')
    @HttpCode(HttpStatus.OK)
    async getOne(
        @Param('bankCode') bankCode: string,
        @Query() query: AvailabilityQueryDto,
    ) {
        const timeWindow = query.window || '1h';
        const data = await this.banksService.getOne(bankCode, timeWindow);
        return { data, requested_window: timeWindow };
    }
}
