import { Module } from '@nestjs/common';
import { CallRecordsController } from './call-records.controller';
import { CallRecordsService } from './call-records.service';
import { S3Service } from '@common/services/s3.service';

@Module({
  controllers: [CallRecordsController],
  providers: [CallRecordsService, S3Service],
  exports: [CallRecordsService],
})
export class CallRecordsModule {}
