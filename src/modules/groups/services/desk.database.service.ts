import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CommonDatabaseService } from '@common/services/common.database.service';
import { DB_COLLECTION_NAMES } from '@constant/common/db-collection-names';
import { LogsDatabaseService } from '@module/activity-logs/services/logs.database.service';
import { IDesk } from '@interface/groups/desk';
import { IDeskModel } from '../schemas/desk.schema';
import { ILoggedUser, IUserGroup } from '@interface/authorization/user';
import { paginator } from '@common/helpers/custom.helper';
import { filterByAggregateName } from '@common/helpers/filter.helper';
import { USER_GROUP_TYPE } from '@constant/groups/groups';

@Injectable()
export class DesksDatabaseService extends CommonDatabaseService<IDesk> {
  constructor(
    @InjectModel(DB_COLLECTION_NAMES.DESKS)
    readonly deskModel: Model<IDeskModel>,
    @InjectModel(DB_COLLECTION_NAMES.USER_GROUPS)
    readonly userGroupModel: Model<IUserGroup>,
    logsDatabaseService: LogsDatabaseService,
  ) {
    super(logsDatabaseService, deskModel, DB_COLLECTION_NAMES.DESKS);
  }

  /**
   * This function filters desk users, retrieves users associated with each desk, and applies pagination.
   */
  async filterSingleDeskUsers(
    searchKey: string,
    deskId: Types.ObjectId,
    skip: number = 0,
    limit: number = 10,
  ): Promise<{
    data: { first_name: string; last_name: string; user_id: Types.ObjectId }[];
  }> {
    const [result] = await this.userGroupModel.aggregate([
      {
        $match: {
          group_id: new Types.ObjectId(deskId),
          group_type: USER_GROUP_TYPE.DESK,
        },
      },
      ...paginator(skip, limit),
      {
        $lookup: {
          from: DB_COLLECTION_NAMES.USERS,
          localField: 'user_id',
          foreignField: '_id',
          as: 'users',
        },
      },
      {
        $unwind: '$users',
      },
      ...filterByAggregateName(searchKey),
      {
        $project: {
          _id: 0,
          data: {
            first_name: '$users.first_name',
            last_name: '$users.last_name',
            user_id: '$users._id',
          },
        },
      },
      {
        $group: {
          _id: null,
          data: { $push: '$data' },
        },
      },
    ]);

    return result || { data: [] };
  }

  /**
   * Get all desks where the user exists
   */
  async getUserDesks(userId: string, searchKey: string) {
    const userObjectId = new Types.ObjectId(userId);

    const pipeline = [
      {
        $match: {
          user_id: userObjectId,
          group_type: USER_GROUP_TYPE.DESK,
        },
      },
      {
        $lookup: {
          from: DB_COLLECTION_NAMES.DESKS,
          localField: 'group_id',
          foreignField: '_id',
          as: 'desk',
        },
      },
      {
        $unwind: '$desk',
      },
      ...(searchKey
        ? [
            {
              $match: {
                'desk.name': {
                  $regex: searchKey,
                  $options: 'i',
                },
              },
            },
          ]
        : []),
      {
        $project: {
          _id: 0,
          id: '$desk._id',
          name: '$desk.name',
        },
      },
    ];

    const userDesks = await this.userGroupModel.aggregate(pipeline);

    return userDesks;
  }

  async getGroupIdsAndReturnsNames(
    groupIds: string[],
  ): Promise<Partial<IDesk[]>> {
    if (groupIds?.length === 0) return;
    const objectIds = groupIds.map((id) => new Types.ObjectId(id));
    const groups = await this.deskModel
      .find({
        _id: { $in: objectIds },
        is_delete: false,
      })
      .select('name')
      .lean();

    return groups;
  }

  /**
   * The function creates a new desk using provided data and saves it to the database
   */
  async createNewDesk(
    deskData: Partial<IDesk>,
    loggedUser: ILoggedUser,
  ): Promise<IDesk> {
    try {
      const newDesk = new this.deskModel({
        ...deskData,
        created_by: loggedUser._id,
      });

      const savedDesk = await newDesk.save();

      return savedDesk.toObject({ versionKey: false });
    } catch (err) {
      new Logger().debug(
        `desk.database.service.ts -> createNewDesk -> ${err}`,
        'DEBUG',
      );
      return null;
    }
  }

  /**
   * This function updates a desk document in a database based on the provided ID and
   * update data, with logging and validation, and returns the updated document or null.
   */
  async findDeskByIdAndUpdate(
    id: Types.ObjectId,
    updateData: Partial<IDesk>,
  ): Promise<IDesk | null> {
    try {
      const updatedDesk = await this.deskModel.findByIdAndUpdate(
        id,
        {
          ...updateData,
        },
        {
          new: true, // Return the modified document rather than the original
          runValidators: true, // Run Mongoose validation
          lean: true, // Return a plain JavaScript object instead of a Mongoose document
        },
      );

      return updatedDesk;
    } catch (err) {
      new Logger().debug(
        `desk.database.service.ts -> findDeskByIdAndUpdate -> ${err}`,
        'DEBUG',
      );
      return null;
    }
  }

  /**
   * Adds a user to all active desks where they're not already present
   */
  async addUserToAllActiveDesks(userId: Types.ObjectId) {
    try {
      // Find all non-deleted desks where the user isn't already present
      const updateResult = await this.deskModel.updateMany(
        {
          is_delete: false,
          users: { $ne: userId },
        },
        {
          $addToSet: { users: userId }, // Use addToSet to prevent duplicates
        },
      );

      return {
        success: true,
        modifiedCount: updateResult.modifiedCount,
        matchedCount: updateResult.matchedCount,
      };
    } catch (err) {
      new Logger().debug(
        `desk.database.service.ts -> addUserToAllActiveDesks -> ${err}`,
        'DEBUG',
      );
      return {
        success: false,
        error: err.message,
      };
    }
  }
}
