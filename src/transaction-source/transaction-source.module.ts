import { Module } from '@nestjs/common';
import { TransactionService } from './transaction-source.service';

@Module({
    providers: [TransactionService],
    exports: [TransactionService],
})
export class TransactionSourceModule {}
