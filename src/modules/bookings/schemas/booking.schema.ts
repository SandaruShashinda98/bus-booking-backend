import { BaseEntitySchemaContent } from '@common/schemas/base-entity.model';
import { DB_COLLECTION_NAMES } from '@constant/common/db-collection-names';
import { IBooking } from '@interface/booking/booking';
import { Document, model, Schema } from 'mongoose';

export type IBookingModel = IBooking & Document;

const BookingSchema = new Schema<IBookingModel>({
  ...BaseEntitySchemaContent,
  reason: {
    type: String,
    required: true,
  },
});

const BookingModel = model<IBookingModel>(
  DB_COLLECTION_NAMES.BOOKINGS,
  BookingSchema,
);
export default BookingModel;
export { BookingSchema };
