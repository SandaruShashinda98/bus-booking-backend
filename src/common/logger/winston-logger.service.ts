import { Injectable, LoggerService } from '@nestjs/common';
import * as winston from 'winston';
import 'winston-daily-rotate-file';
import * as path from 'path';

@Injectable()
export class WinstonLogger implements LoggerService {
  private readonly logger: winston.Logger;

  constructor() {
    const logDir = path.join(process.cwd(), 'logs');

    const dailyRotateFile = new winston.transports.DailyRotateFile({
      filename: path.join(logDir, 'log_file.log'),
      datePattern: 'YYYY-MM-DD-THH',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '30d',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json(),
      ),
    });

    const customFormat = winston.format.printf(
      ({ timestamp, level, message, context }) => {
        const colorizer = winston.format.colorize();
        const timestampColor = colorizer.colorize('info', timestamp as string);
        const contextColor = context
          ? colorizer.colorize('warn', `[${context}]`)
          : '';
        const messageColor = colorizer.colorize(level, message as string);

        return `${timestampColor} ${colorizer.colorize(level, level.toUpperCase())} ${contextColor} ${messageColor}`;
      },
    );

    this.logger = winston.createLogger({
      level: 'silly',
      format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.errors({ stack: true }),
        customFormat,
      ),
      transports: [
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize({ all: true }),
          ),
        }),
        dailyRotateFile,
      ],
    });
  }

  log(message: string, context?: string) {
    this.logger.info(message, { context });
  }

  error(message: string, trace?: string, context?: string) {
    this.logger.error(message, { trace, context });
  }

  warn(message: string, context?: string) {
    this.logger.warn(message, { context });
  }

  debug(message: string, context?: string) {
    this.logger.debug(message, { context });
  }

  verbose(message: string, context?: string) {
    this.logger.verbose(message, { context });
  }
}
