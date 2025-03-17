import { Global, Module } from '@nestjs/common';
import { ResponseService } from './services/response.service';
import { WinstonLogger } from './logger/winston-logger.service';
import { ExportService } from './services/export.service';
import { S3Service } from './services/s3.service';
import { EmailService } from './services/email.service';

const services = [
  ResponseService,
  WinstonLogger,
  ExportService,
  S3Service,
  EmailService,
];
@Global()
@Module({
  controllers: [],
  imports: [],
  providers: services,
  exports: services,
})
export class CommonModule {}
