import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CommonDatabaseService } from '@common/services/common.database.service';
import { DB_COLLECTION_NAMES } from '@constant/common/db-collection-names';
import { IBus } from '@interface/booking/booking';
import { IBusModel } from '../schema/bus.schema';

@Injectable()
export class BusService extends CommonDatabaseService<IBus> {
  constructor(
    @InjectModel(DB_COLLECTION_NAMES.BUSSES)
    readonly busModel: Model<IBusModel>,
  ) {
    super(busModel, DB_COLLECTION_NAMES.BUSSES);
  }
}
