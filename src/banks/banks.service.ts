import { Injectable, NotFoundException } from '@nestjs/common';
import { TimeWindow } from 'src/common/constants/time-windows';
import { DatabaseService } from 'src/common/database/database.service';

@Injectable()
export class BanksService {
    constructor(
        private readonly dbService: DatabaseService) {}

    async getAll(window: TimeWindow) {
        const records = await this.dbService.bankAvailability.findMany({
            where: { time_window: window },
        });

        if (!records.length) throw new NotFoundException('No data for banks');
        return records;
    }

    async getOne(code: string, window: TimeWindow) {
        const record = await this.dbService.bankAvailability.findUnique({
            where: { bank_nip_code_time_window: { bank_nip_code: code, time_window: window }},
        });
        if (!record) throw new NotFoundException('Bank not found');
        return record;
    }
}
