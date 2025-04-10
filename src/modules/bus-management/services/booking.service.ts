import { CommonDatabaseService } from '@common/services/common.database.service';
import { DB_COLLECTION_NAMES } from '@constant/common/db-collection-names';
import { IBooking } from '@interface/booking/booking';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { IBookingModel } from '../../bus-management/schema/booking.schema';
import { Model } from 'mongoose';

@Injectable()
export class BookingService extends CommonDatabaseService<IBooking> {
  constructor(
    @InjectModel(DB_COLLECTION_NAMES.BOOKINGS)
    readonly bookingModel: Model<IBookingModel>,
  ) {
    super(bookingModel, DB_COLLECTION_NAMES.BOOKINGS);
  }
}
