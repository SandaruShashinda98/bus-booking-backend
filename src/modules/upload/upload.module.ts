import { forwardRef, Global, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DB_COLLECTION_NAMES } from '@constant/common/db-collection-names';
import { UploadDatabaseService } from './services/upload.database.service';
import { UploadService } from './services/upload.service';
import { UploadSchema } from './schemas/upload-entity.schema';
import { FileUploadController } from './controllers/upload.controller';
import { HttpModule } from '@nestjs/axios';
import { CommonUploadController } from './controllers/common.upload.controller';
import { CommonUploadService } from './services/common.upload.service';

const services = [UploadDatabaseService, UploadService, CommonUploadService];
@Global()
@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: DB_COLLECTION_NAMES.UPLOAD,
        schema: UploadSchema,
      },
    ]),
    HttpModule,
  ],
  controllers: [FileUploadController, CommonUploadController],
  providers: services,
  exports: services,
})
export class UploadModule {}
