import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, PipelineStage, Types } from 'mongoose';
import { CommonDatabaseService } from '@common/services/common.database.service';
import { DB_COLLECTION_NAMES } from '@constant/common/db-collection-names';
import { ILoggedUser } from '@interface/authorization/user';
import { IObjectList } from '@interface/settings/object-list';
import { IObjectListModel } from '../schemas/object-list.schema';
import { GetObjectListQueryDTO } from '@dto/settings/object-list-query-params.dto';
import { paginator, responseOrderMaker } from '@common/helpers/custom.helper';

@Injectable()
export class ObjectListsDatabaseService extends CommonDatabaseService<IObjectList> {
  constructor(
    @InjectModel(DB_COLLECTION_NAMES.OBJECT_LISTS)
    readonly objectListModel: Model<IObjectListModel>,
  ) {
    super(objectListModel, DB_COLLECTION_NAMES.OBJECT_LISTS);
  }

  /**
   * This function filters object-lists based on the given filters with optional pagination parameters for search.
   */
  async filterObjectLists(
    filters: FilterQuery<GetObjectListQueryDTO>,
    skip: number = 0,
    limit: number = 10,
  ): Promise<{ data: any[]; count: number }> {
    const aggregationPipeline: PipelineStage[] = [
      { $match: filters },
      {
        $facet: {
          data: [
            { $sort: { created_on: -1 } },
            ...paginator(skip, limit),
            {
              $project: {
                _id: 1,
                name: 1,
                list_type: 1,
                object_count: { $size: '$objects' },
                created_on: 1,
                created_by: 1,
                changed_by: 1,
                last_modified_on: 1,
                is_active: 1,
                is_delete: 1,
              },
            },
          ],
          count: [{ $count: 'total' }],
        },
      },
      {
        $project: {
          data: 1,
          count: { $arrayElemAt: ['$count.total', 0] },
        },
      },
    ];

    const result = await this.objectListModel.aggregate(aggregationPipeline);

    // Return the data and count in the common format
    return {
      data: responseOrderMaker(skip, limit, result[0].data, result[0].count),
      count: result[0].count || 0,
    };
  }

  /*
   * This function creates a new object-list with the given data.
   */
  async createNewObjectList(
    objectListData: Partial<IObjectList>,
    loggedUser?: ILoggedUser,
  ): Promise<IObjectList> {
    try {
      const newList = new this.objectListModel({
        ...objectListData,
        created_by: loggedUser?._id,
      });

      const savedList = await newList.save();

      return savedList.toObject({ versionKey: false });
    } catch (err) {
      new Logger().debug(
        `object-list.database.service.ts -> createNewObjectList -> ${err}`,
        'DEBUG',
      );
      return null;
    }
  }

  /*
   * This function finds a single object-list by its id and update with given data.
   */
  async findObjectListByIdAndUpdate(
    id: Types.ObjectId,
    updateData: Partial<IObjectList>,
    loggedUser: ILoggedUser,
  ): Promise<IObjectList | null> {
    try {
      const updatedObjectList = await this.objectListModel.findByIdAndUpdate(
        id,
        {
          ...updateData,
          changed_by: loggedUser._id,
          last_modified_on: new Date(),
        },
        {
          new: true,
          runValidators: true,
          lean: true,
        },
      );

      return updatedObjectList;
    } catch (err) {
      new Logger().debug(
        `object-list.database.service.ts -> findObjectListByIdAndUpdate -> ${err}`,
        'DEBUG',
      );
      return null;
    }
  }
}
