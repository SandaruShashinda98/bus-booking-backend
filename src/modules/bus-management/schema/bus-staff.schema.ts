import { BaseEntitySchemaContent } from '@common/schemas/base-entity.model';
import { DB_COLLECTION_NAMES } from '@constant/common/db-collection-names';
import { IBusStaff } from '@interface/booking/booking';
import { Document, model, Schema } from 'mongoose';

export type IBusStaffModel = IBusStaff & Document;

const BusStaffSchema = new Schema<IBusStaffModel>({
  ...BaseEntitySchemaContent,
  staff_id: {
    type: String,
    required: true,
  },
  staff_name: {
    type: String,
  },
  role: {
    type: String,
  },
  contact_number: {
    type: String,
  },
  assigned_bus_number: {
    type: String,
  },
  assigned_trip: {
    type: String,
  },
});

const BusStaffModel = model<IBusStaffModel>(
  DB_COLLECTION_NAMES.BUS_STAFF,
  BusStaffSchema,
);
export default BusStaffModel;
export { BusStaffSchema };
