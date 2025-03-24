import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CommonDatabaseService } from '@common/services/common.database.service';
import { DB_COLLECTION_NAMES } from '@constant/common/db-collection-names';
import { ITrip } from '@interface/booking/booking';
import { ITripModel } from '../schema/trips.schema';

@Injectable()
export class TripService extends CommonDatabaseService<ITrip> {
  constructor(
    @InjectModel(DB_COLLECTION_NAMES.TRIPS)
    readonly tripModel: Model<ITripModel>,
  ) {
    super(tripModel, DB_COLLECTION_NAMES.TRIPS);
  }
}
