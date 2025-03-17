import { DB_COLLECTION_NAMES } from '@constant/common/db-collection-names';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ActivitySchema } from './schemas/activity.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: DB_COLLECTION_NAMES.ACTIVITY, schema: ActivitySchema },
    ]),
  ],
  controllers: [],
  providers: [],
  exports: [],
})
export class ActivityModule {}
