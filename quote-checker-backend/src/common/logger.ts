import { utilities, WinstonModule } from 'nest-winston';
import { format, transports } from 'winston';

const SERVICE_NAME = 'quote-checker-backend';
const isProduction = process.env.NODE_ENV === 'production';

const jsonFormat = format.combine(
  format.timestamp(),
  format.errors({ stack: true }),
  format.json(),
);

const prettyFormat = format.combine(
  format.timestamp(),
  format.ms(),
  utilities.format.nestLike(SERVICE_NAME, {
    colors: true,
    prettyPrint: true,
    processId: false,
    appName: true,
  }),
);

export const logger = WinstonModule.createLogger({
  level: process.env.LOG_LEVEL ?? 'info',
  defaultMeta: isProduction
    ? { service: SERVICE_NAME, environment: process.env.NODE_ENV }
    : undefined,
  format: isProduction ? jsonFormat : prettyFormat,
  transports: [new transports.Console()],
});
