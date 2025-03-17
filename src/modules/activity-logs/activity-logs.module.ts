/* The `ActivityLogsModule` class defines a module in a NestJS application for managing activity logs
using Mongoose and exports a service for interacting with the logs database. */
import { DB_COLLECTION_NAMES } from '@constant/common/db-collection-names';
import { Global, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LogSchema } from './schemas/log.schema';
import { LogsDatabaseService } from './services/logs.database.service';

@Global()
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: DB_COLLECTION_NAMES.LOGS, schema: LogSchema },
    ]),
  ],
  providers: [LogsDatabaseService],
  exports: [LogsDatabaseService],
})
export class ActivityLogsModule {}
