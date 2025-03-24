import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CommonDatabaseService } from '@common/services/common.database.service';
import { DB_COLLECTION_NAMES } from '@constant/common/db-collection-names';
import { IRestaurant } from '@interface/booking/booking';
import { IRestaurantModel } from '../schema/restaurant.schema';

@Injectable()
export class RestaurantService extends CommonDatabaseService<IRestaurant> {
  constructor(
    @InjectModel(DB_COLLECTION_NAMES.RESTAURANTS)
    readonly restaurantModel: Model<IRestaurantModel>,
  ) {
    super(restaurantModel, DB_COLLECTION_NAMES.RESTAURANTS);
  }
}
