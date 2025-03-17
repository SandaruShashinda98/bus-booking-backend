import { Module } from '@nestjs/common';
import { DB_COLLECTION_NAMES } from '@constant/common/db-collection-names';
import { MongooseModule } from '@nestjs/mongoose';
import { ClockOutReasonSchema } from '../references/schemas/clock-out-reason.schema';
import { ClockOutReasonsController } from '../references/controllers/clock-out-reason.controller';
import { ClockOutReasonDatabaseService } from '../references/services/clock-out-reason.database.service';
import { ReferenceService } from '../references/services/reference.service';

const services = [ClockOutReasonDatabaseService, ReferenceService];
@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: DB_COLLECTION_NAMES.CLOCK_OUT_REASONS,
        schema: ClockOutReasonSchema,
      },
    ]),
  ],
  controllers: [ClockOutReasonsController],
  providers: services,
  exports: services,
})
export class ReferenceModule {}
