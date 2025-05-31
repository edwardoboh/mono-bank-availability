import { StatusCount } from "src/common/constants/status-counts";
import { TimeWindow } from "src/common/constants/time-windows";

export interface TransactionSource {
    getStatusCounts(bankCode: string, timeWindow: TimeWindow): Promise<StatusCount | null>;
}
