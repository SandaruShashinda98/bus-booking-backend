import { Global, Module } from '@nestjs/common';
import { DB_COLLECTION_NAMES } from '@constant/common/db-collection-names';
import { MongooseModule } from '@nestjs/mongoose';
import { BusController } from './controlers/bus.controller';
import { BusService } from './services/bus.service';
import { TripService } from './services/trip.service';
import { TripController } from './controlers/trip.controller';
import { BookingSchema } from '@module/bus-management/schema/booking.schema';
import { BusSchema } from './schema/bus.schema';
import { TripSchema } from './schema/trips.schema';
import { BusStaffController } from './controlers/bus-staff.controller';
import { BusStaffSchema } from './schema/bus-staff.schema';
import { BusStaffService } from './services/bus-staff.service';
import { BookingService } from './services/booking.service';
import { BookingController } from './controlers/booking.controller';

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
  {
    name: DB_COLLECTION_NAMES.BUS_STAFF,
    schema: BusStaffSchema,
  },
];

const services = [BusService, TripService, BusStaffService, BookingService];
@Global()
@Module({
  imports: [MongooseModule.forFeature(MongooseModules)],
  controllers: [BusController, TripController, BusStaffController, BookingController],
  providers: services,
  exports: services,
})
export class BusManagementModule {}
