import { BaseEntitySchemaContent } from '@common/schemas/base-entity.model';
import { DB_COLLECTION_NAMES } from '@constant/common/db-collection-names';
import { IBus } from '@interface/booking/booking';
import { Document, model, Schema } from 'mongoose';

export type IBusModel = IBus & Document;

const BusSchema = new Schema<IBusModel>({
  ...BaseEntitySchemaContent,
  bus_number: {
    type: String,
    required: true,
  },
});

const BusModel = model<IBusModel>(
  DB_COLLECTION_NAMES.BUSSES,
  BusSchema,
);
export default BusModel;
export { BusSchema };
