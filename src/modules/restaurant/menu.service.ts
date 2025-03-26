import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CommonDatabaseService } from '@common/services/common.database.service';
import { DB_COLLECTION_NAMES } from '@constant/common/db-collection-names';
import { IMenu } from '@interface/booking/booking';
import { IMenuModel } from './menu.schemea';

@Injectable()
export class MenuService extends CommonDatabaseService<IMenu> {
  constructor(
    @InjectModel(DB_COLLECTION_NAMES.MENUS)
    readonly menuModel: Model<IMenuModel>,
  ) {
    super(menuModel, DB_COLLECTION_NAMES.MENUS);
  }

  async filterMenuOrders() {
    try {
      // Use aggregation pipeline to get all orders
      const allOrders = await this.menuModel.aggregate([
        // Match documents that have orders
        {
          $match: {
            orders: { $exists: true, $ne: [] },
          },
        },
        // Unwind the orders array to get one document per order
        {
          $unwind: '$orders',
        },
        // Project only the fields we need
        {
          $project: {
            food: 1,
            nic: '$orders.order_by_nic',
            qty: '$orders.qty',
            price: { $ifNull: ['$price', 0] },
            date: { $ifNull: ['$date', new Date()] },
          },
        },
      ]);

      return {
        data: allOrders,
        count: allOrders.length,
      };
    } catch (error) {
      console.error('Error fetching orders:', error);
      return null;
    }
  }
}
