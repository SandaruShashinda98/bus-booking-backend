import { Module } from '@nestjs/common';
import { DB_COLLECTION_NAMES } from '@constant/common/db-collection-names';
import { MongooseModule } from '@nestjs/mongoose';
import { BookingSchema } from './schemas/booking.schema';
import { BookingService } from './services/booking.service';
import { BookingController } from './controllers/booking.controller';

const services = [BookingService];
@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: DB_COLLECTION_NAMES.BOOKINGS,
        schema: BookingSchema,
      },
    ]),
  ],
  controllers: [BookingController],
  providers: services,
  exports: services,
})
export class BookingModule {}
