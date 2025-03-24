import { BaseEntitySchemaContent } from '@common/schemas/base-entity.model';
import { DB_COLLECTION_NAMES } from '@constant/common/db-collection-names';
import { IFood, IRestaurant } from '@interface/booking/booking';
import { Document, model, Schema } from 'mongoose';

export type IRestaurantModel = IRestaurant & Document;

const foodSchema = new Schema<IFood>({
  food_name: { type: String },
  price: { type: String },
  date: { type: Date },
  ingredients: [{ type: String }],
});

const RestaurantSchema = new Schema<IRestaurantModel>({
  ...BaseEntitySchemaContent,
  name: {
    type: String,
    required: true,
  },
  foods: [foodSchema],
});

const RestaurantModel = model<IRestaurantModel>(
  DB_COLLECTION_NAMES.RESTAURANTS,
  RestaurantSchema,
);
export default RestaurantModel;
export { RestaurantSchema };
