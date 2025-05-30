import * as Joi from 'joi';

export const EnvValidationSchema = Joi.object({
    DATABASE_URL: Joi.string().required(),
    BANK_CODES: Joi.string().required(),
    CONF_LOW_MAX: Joi.number().default(10),
    CONF_MED_MAX: Joi.number().default(50),
    WINDOW_1H_POLL_MS: Joi.number().default(300000),
    WINDOW_6H_POLL_MS: Joi.number().default(900000),
    WINDOW_24H_POLL_MS: Joi.number().default(3600000),
    API_KEY: Joi.string().optional(),
})