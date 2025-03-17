import { Module } from '@nestjs/common';
import { ClockedInService } from './clocked-in-stats.service';
import { ClockedInController } from './clocked-in-stats.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { DB_COLLECTION_NAMES } from '@constant/common/db-collection-names';
import { UserSchema } from '@module/users/schemas/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: DB_COLLECTION_NAMES.USERS, schema: UserSchema },
    ]),
  ],
  controllers: [ClockedInController],
  providers: [ClockedInService],
  exports: [ClockedInService],
})
export class ClockedInModule {}
