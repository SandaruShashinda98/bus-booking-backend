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
    type: String,
  },
  seats: {
    type: [Number],
  },
  passenger_name: {
    type: String,
  },
  nic: {
    type: String,
  },
  pick_up_location: {
    type: String,
  },
  drop_location: {
    type: String,
  },
  contact_no: {
    type: String,
  },
  email: {
    type: String,
  },
  guardian_contact: {
    type: String,
  },
  special_instruction: {
    type: String,
  },

  // Payment details
  card_number: {
    type: String,
  },
  card_expiry_date: {
    type: String,
  },
  card_cvc: {
    type: String,
  },
  card_holder_name: {
    type: String,
  },
  total_amount: {
    type: Schema.Types.Mixed,
  },
});

// Create a pre-save hook to auto-increment booking_id
// BookingSchema.pre('save', async function (next) {
//   if (this.isNew) {
//     try {
//       // Find the count of documents to generate the next booking_id
//       const count = await model(DB_COLLECTION_NAMES.BOOKINGS).countDocuments();
//       this.booking_id = count + 1;
//       next();
//     } catch (error) {
//       next(error);
//     }
//   } else {
//     next();
//   }
// });

const BookingModel = model<IBookingModel>(
  DB_COLLECTION_NAMES.BOOKINGS,
  BookingSchema,
);

export default BookingModel;
export { BookingSchema };
