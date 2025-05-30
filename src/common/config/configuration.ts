export default () => ({
  bankCodes: process.env.BANK_CODES?.split(',') || [],
  confidence: {
    lowMax: parseInt(process.env.CONF_LOW_MAX ?? '10', 10),
    medMax: parseInt(process.env.CONF_MED_MAX ?? '50', 10),
  },
  pollingMs: {
    '1h': parseInt(process.env.WINDOW_1H_POLL_MS ?? '300000', 10),
    '6h': parseInt(process.env.WINDOW_6H_POLL_MS ?? '900000', 10),
    '24h': parseInt(process.env.WINDOW_24H_POLL_MS ?? '3600000', 10),
  },
  apiKey: process.env.API_KEY,
});
