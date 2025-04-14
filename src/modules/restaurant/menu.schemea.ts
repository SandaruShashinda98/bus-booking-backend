import { BaseEntitySchemaContent } from '@common/schemas/base-entity.model';
import { DB_COLLECTION_NAMES } from '@constant/common/db-collection-names';
import { IMenu } from '@interface/booking/booking';
import { Document, model, Schema } from 'mongoose';

export type IMenuModel = IMenu & Document;

const MenuSchema = new Schema<IMenuModel>({
  ...BaseEntitySchemaContent,
  restaurant: {
    type: String,
  },
  food: {
    type: String,
  },
  ingredients: {
    type: String,
  },
  price: {
    type: Number,
  },
  date: {
    type: Date,
  },
  count: {
    type: Schema.Types.Mixed,
  },
  is_available: {
    type: Boolean,
    default: true
  },
  orders: {
    type: Schema.Types.Mixed,
  },
});

const MenuModel = model<IMenuModel>(DB_COLLECTION_NAMES.MENUS, MenuSchema);
export default MenuModel;
export { MenuSchema };
