import { HttpException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { TimeWindow } from 'src/common/constants/time-windows';
import { DatabaseService } from '../common/database/database.service';

@Injectable()
export class BanksService {
    constructor(
        private readonly dbService: DatabaseService) {}

    async getAll(window: TimeWindow) {
        try {
            const records = await this.dbService.bankAvailability.findMany({
                where: { time_window: window },
            });

            if (!records.length) throw new NotFoundException('No data for banks');
            return records;
        } catch (error) {
            if (error instanceof HttpException) throw error;
            throw new InternalServerErrorException("Internal Server Error");
        }
    }

    async getOne(code: string, timeWindow: TimeWindow) {
        try {
            const record = await this.dbService.bankAvailability.findUnique({
                where: { bank_nip_code_time_window: { bank_nip_code: code, time_window: timeWindow }},
            });

            if (!record) throw new NotFoundException('Bank not found');
            return record;
        } catch (error) {
            if (error instanceof HttpException) throw error;
            throw new InternalServerErrorException("Internal Server Error");
        }
    }
}
