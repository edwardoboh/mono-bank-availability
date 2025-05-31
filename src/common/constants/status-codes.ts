export const STATUS_CODES = [
    '00',
    '01',
    '91',
    '97',
] as const;
export type StatusCode = typeof STATUS_CODES[number];