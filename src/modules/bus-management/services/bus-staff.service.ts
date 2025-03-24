import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CommonDatabaseService } from '@common/services/common.database.service';
import { DB_COLLECTION_NAMES } from '@constant/common/db-collection-names';
import { IBusStaff } from '@interface/booking/booking';
import { IBusStaffModel } from '../schema/bus-staff.schema';

@Injectable()
export class BusStaffService extends CommonDatabaseService<IBusStaff> {
  constructor(
    @InjectModel(DB_COLLECTION_NAMES.BUS_STAFF)
    readonly busStaffModel: Model<IBusStaffModel>,
  ) {
    super(busStaffModel, DB_COLLECTION_NAMES.BUS_STAFF);
  }
}
