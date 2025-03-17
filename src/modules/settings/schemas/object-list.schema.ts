import { BaseEntitySchemaContent } from '@common/schemas/base-entity.model';
import { DB_COLLECTION_NAMES } from '@constant/common/db-collection-names';
import { LIST_TYPE } from '@constant/settings/object-list';
import { IObjectList } from '@interface/settings/object-list';
import { Document, model, Schema } from 'mongoose';

export type IObjectListModel = IObjectList & Document;

const ObjectListSchema = new Schema<IObjectListModel>({
  ...BaseEntitySchemaContent,
  name: {
    type: String,
    required: true,
  },
  list_type: {
    type: String,
    enum: LIST_TYPE,
    required: true,
    index: true,
  },
  is_clone: {
    type: Boolean,
    default: false,
    required: true,
  },
  objects: {
    type: Schema.Types.Mixed,
    default: [],
  },
});

const ObjectListModel = model<IObjectListModel>(
  DB_COLLECTION_NAMES.OBJECT_LISTS,
  ObjectListSchema,
);
export default ObjectListModel;
export { ObjectListSchema };
