import * as winston from 'winston';
const { combine, timestamp, printf, simple, align } = winston.format;

export const winstonLogger = winston.createLogger({
    level: 'debug',
    format: combine(
        timestamp({ format: 'YYYY-MM-DD hh:mm:ss.SSS A' }),
        simple(),
        align(),
        printf(
            (info) => `[${info.timestamp}] ${info.level} --- ${info.message}`,
        ),
    ),
    transports: [
        new winston.transports.Console(),

        new winston.transports.File({
            filename: 'blog-community-logger.log',
            dirname: 'logs',
        }),
    ],
});
