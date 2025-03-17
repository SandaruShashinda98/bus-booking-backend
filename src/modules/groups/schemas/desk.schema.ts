import { BaseEntitySchemaContent } from '@common/schemas/base-entity.model';
import { DB_COLLECTION_NAMES } from '@constant/common/db-collection-names';
import { IDesk } from '@interface/groups/desk';
import { Document, model, Schema } from 'mongoose';

export type IDeskModel = IDesk & Document;

const DeskSchema = new Schema<IDeskModel>({
  ...BaseEntitySchemaContent,
  name: {
    type: String,
  },
});

const DeskModel = model<IDeskModel>(DB_COLLECTION_NAMES.DESKS, DeskSchema);
export default DeskModel;
export { DeskSchema };
