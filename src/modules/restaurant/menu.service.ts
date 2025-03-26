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
    readonly busModel: Model<IMenuModel>,
  ) {
    super(busModel, DB_COLLECTION_NAMES.MENUS);
  }
}
