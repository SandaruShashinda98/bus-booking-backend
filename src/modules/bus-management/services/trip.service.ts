import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, PipelineStage } from 'mongoose';
import { CommonDatabaseService } from '@common/services/common.database.service';
import { DB_COLLECTION_NAMES } from '@constant/common/db-collection-names';
import { ITrip } from '@interface/booking/booking';
import { ITripModel } from '../schema/trips.schema';
import { responseOrderMaker } from '@common/helpers/custom.helper';

@Injectable()
export class TripService extends CommonDatabaseService<ITrip> {
  constructor(
    @InjectModel(DB_COLLECTION_NAMES.TRIPS)
    readonly tripModel: Model<ITripModel>,
  ) {
    super(tripModel, DB_COLLECTION_NAMES.TRIPS);
  }

  async filterTripsWith(
    filters: FilterQuery<any>,
    skip: number = 0,
    limit: number = 10,
  ): Promise<{ data: any[]; count: number }> {
    // Define the lookup stage to join with users collection
    const lookupStage: PipelineStage = {
      $lookup: {
        from: DB_COLLECTION_NAMES.USERS, // The collection name in the database
        localField: 'created_by',
        foreignField: '_id',
        as: 'creator',
      },
    };

    // Define the unwind stage to flatten the creator array
    const unwindStage: PipelineStage = {
      $unwind: {
        path: '$creator',
        preserveNullAndEmptyArrays: true, // Keep trips even if creator not found
      },
    };

    // Define the project stage to shape the final output
    const projectStage: PipelineStage = {
      $project: {
        _id: 1,
        start_location: 1,
        destination: 1,
        start_date: 1,
        end_date: 1,
        status: 1,
        price: 1,
        booked_seats: 1,
        created_on: 1,
        last_modified_on: 1,
        is_active: 1,
        creator: {
          _id: '$creator._id',
          first_name: '$creator.first_name',
          last_name: '$creator.last_name',
          email: '$creator.email',
          username: '$creator.username',
          contact_number: '$creator.contact_number',
        },
      },
    };

    const aggregationPipeline: PipelineStage[] = [
      { $match: filters },
      {
        $facet: {
          data: [
            { $sort: { created_on: -1 } },
            lookupStage,
            unwindStage,
            projectStage,
          ],
          count: [{ $count: 'total' }],
        },
      },
      {
        $project: {
          data: 1,
          count: { $arrayElemAt: ['$count.total', 0] }, // Safely extract the count or return 0 if undefined
        },
      },
    ];

    const result = await this.tripModel.aggregate(aggregationPipeline);

    // Return the data and count in the common format
    return {
      data: responseOrderMaker(skip, limit, result[0].data, result[0].count),
      count: result[0].count || 0,
    };
  }
}
