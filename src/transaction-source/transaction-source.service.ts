import { Injectable } from '@nestjs/common';
import { TransactionSource } from './transaction-source.interface';
import { StatusCount } from 'src/common/constants/status-counts';
import { TimeWindow } from 'src/common/constants/time-windows';
import * as path from 'path';
import * as fs from 'fs';

@Injectable()
export class TransactionService implements TransactionSource {
    private data: Record<string, Record<TimeWindow, StatusCount>>;

    constructor() {
        const filePath = path.join(__dirname, 'data', 'transactions.json');
        this.data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    }

    getStatusCounts(bankCode: string, timeWindow: TimeWindow): Promise<StatusCount | null> {
        return Promise.resolve(this.data?.[bankCode]?.[timeWindow]) ?? Promise.resolve(null);
    }
}
