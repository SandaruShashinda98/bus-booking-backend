import { BaseEntitySchemaContent } from '@common/schemas/base-entity.model';
import { DB_COLLECTION_NAMES } from '@constant/common/db-collection-names';
import { ITrip } from '@interface/booking/booking';
import { Document, model, Schema } from 'mongoose';

export type ITripModel = ITrip & Document;

const TripSchema = new Schema<ITripModel>({
  ...BaseEntitySchemaContent,
  start_location: {
    type: String,
    required: true,
  },
  end_location: {
    type: String,
    required: true,
  },
});

const TripModel = model<ITripModel>(DB_COLLECTION_NAMES.TRIPS, TripSchema);
export default TripModel;
export { TripSchema };
