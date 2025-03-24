import { BaseEntitySchemaContent } from '@common/schemas/base-entity.model';
import { DB_COLLECTION_NAMES } from '@constant/common/db-collection-names';
import { IBooking } from '@interface/booking/booking';
import { Document, model, Schema } from 'mongoose';

export type IBookingModel = IBooking & Document;

const BookingSchema = new Schema<IBookingModel>({
  ...BaseEntitySchemaContent,
  trip_id: {
    type: Schema.Types.ObjectId,
    ref: DB_COLLECTION_NAMES.TRIPS,
    required: true,
  },
  booking_id: {
    type: Number,
    required: true,
  },
  seats: {
    type: [Number],
    required: true,
  },
  passenger_name: {
    type: String,
    required: true,
  },
  passenger_nic: {
    type: String,
    required: true,
  },
  pick_up_location: {
    type: String,
    required: true,
  },
  drop_off_location: {
    type: String,
    required: true,
  },
  contact_no: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: false,
  },
  guardian_contact_no: {
    type: String,
    required: false,
  },
  special_instruction: {
    type: String,
    required: false,
  },
});

// Create a pre-save hook to auto-increment booking_id
BookingSchema.pre('save', async function (next) {
  if (this.isNew) {
    try {
      // Find the count of documents to generate the next booking_id
      const count = await model(DB_COLLECTION_NAMES.BOOKINGS).countDocuments();
      this.booking_id = count + 1;
      next();
    } catch (error) {
      next(error);
    }
  } else {
    next();
  }
});

const BookingModel = model<IBookingModel>(
  DB_COLLECTION_NAMES.BOOKINGS,
  BookingSchema,
);

export default BookingModel;
export { BookingSchema };
