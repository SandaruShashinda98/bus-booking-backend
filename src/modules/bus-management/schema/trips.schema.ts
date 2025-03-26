import { BaseEntitySchemaContent } from '@common/schemas/base-entity.model';
import { DB_COLLECTION_NAMES } from '@constant/common/db-collection-names';
import { ITrip } from '@interface/booking/booking';
import { Document, model, Schema } from 'mongoose';

export type ITripModel = ITrip & Document;

const TripSchema = new Schema<ITripModel>({
  ...BaseEntitySchemaContent,
  start_location: {
    type: String,
  },
  destination: {
    type: String,
  },
  start_date: {
    type: Schema.Types.Mixed,
  },
  end_date: {
    type: Schema.Types.Mixed,
  },
  status: {
    type: Schema.Types.Mixed,
  },
  price: {
    type: Schema.Types.Mixed,
  },
  booked_seats: {
    type: Schema.Types.Mixed,
  },
  bus_number: {
    type: Schema.Types.Mixed,
  },
});

const TripModel = model<ITripModel>(DB_COLLECTION_NAMES.TRIPS, TripSchema);
export default TripModel;
export { TripSchema };
