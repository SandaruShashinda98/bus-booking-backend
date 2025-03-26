import { Global, Module } from '@nestjs/common';
import { DB_COLLECTION_NAMES } from '@constant/common/db-collection-names';
import { MongooseModule } from '@nestjs/mongoose';
import { BookingService } from './services/booking.service';
import { BookingController } from './controllers/booking.controller';
// import { BusSchema } from '@module/bus-management/schema/bus.schema';
import { TripSchema } from '@module/bus-management/schema/trips.schema';
import { BookingSchema } from './schemas/booking.schema';
import { BusSchema } from '@module/bus-management/schema/bus.schema';

const MongooseModules = [
  {
    name: DB_COLLECTION_NAMES.BOOKINGS,
    schema: BookingSchema,
  },
  {
    name: DB_COLLECTION_NAMES.BUSSES,
    schema: BusSchema,
  },
  {
    name: DB_COLLECTION_NAMES.TRIPS,
    schema: TripSchema,
  },
];
const services = [BookingService];

@Global()
@Module({
  imports: [MongooseModule.forFeature(MongooseModules)],
  controllers: [BookingController],
  providers: services,
  exports: services,
})
export class BookingModule {}
