import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DatabaseService } from 'src/common/database/database.service';
import { Interval } from '@nestjs/schedule';
import { Logger } from '@nestjs/common';
import { TransactionService } from 'src/transaction-source/transaction-source.service';
import { TimeWindow } from 'src/common/constants/time-windows';

@Injectable()
export class AvailabilityService {
    private readonly logger = new Logger(AvailabilityService.name);
    private readonly bankCodes: string[];

    constructor(
        private readonly config: ConfigService,
        private readonly txService: TransactionService,
        private readonly dbService: DatabaseService,
    ) {
        this.bankCodes = this.config.get<string[]>('bankCodes');
    }

    // Default job every 5 minutes
    @Interval(30000)
    async processOneHourWindow() {
        await this.processWindow('1h');
    }

    @Interval(90000)
    async processSixHourWindow() {
        await this.processWindow('6h');
    }

    @Interval(360000)
    async processTwentyFourHourWindow() {
        await this.processWindow('24h');
    }

    async processWindow(timeWindow: TimeWindow) {
        for (const code of this.bankCodes) {
            // Fetch aggregated status counts for the bank code and time window
            const counts = await this.txService.getStatusCounts(code, timeWindow);
            const statusCounts = counts ?? { "00": 0, "01": 0, "91": 0, "97": 0 };

            // Calculate successful and total transactions
            const success = statusCounts['00'] + statusCounts['01'];
            const total = success + statusCounts['91'] + statusCounts['97'];
            
            let availability: number = null;
            if (total > 0) {
                availability = parseFloat((success / total * 100).toFixed(2));
            }

            const confidence = this.deriveConfidence(total);
            await this.dbService.bankAvailability.upsert({
                where: { bank_nip_code_time_window: { bank_nip_code: code, time_window: timeWindow }},
                update: {
                    availability_percentage: availability,
                    confidence_level: confidence,
                    total_transactions_in_window: total,
                    status_counts: statusCounts,
                    last_calculated_at: new Date(),
                },
                create: {
                    bank_nip_code: code,
                    time_window: timeWindow,
                    availability_percentage: availability,
                    confidence_level: confidence,
                    total_transactions_in_window: total,
                    status_counts: statusCounts,
                }
            });
        }
        this.logger.debug(`Processed window ${timeWindow}`);
    }

    deriveConfidence(total: number): string {
        if (total === 0) return 'Insufficient Data';
        const lowMax = this.config.get<number>('confidence.lowMax');
        const medMax = this.config.get<number>('confidence.medMax');
        if (total <= lowMax) return 'Low';
        if (total <= medMax) return 'Medium';
        return 'High';
    }
}
