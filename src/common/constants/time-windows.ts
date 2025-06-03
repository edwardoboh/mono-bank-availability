export const TIME_WINDOWS = [
    '1h',
    '6h',
    '24h'
] as const;
export type TimeWindow = typeof TIME_WINDOWS[number];