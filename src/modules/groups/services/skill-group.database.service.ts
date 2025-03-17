import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CommonDatabaseService } from '@common/services/common.database.service';
import { DB_COLLECTION_NAMES } from '@constant/common/db-collection-names';
import { LogsDatabaseService } from '@module/activity-logs/services/logs.database.service';
import { ISkillGroup } from '@interface/groups/skill-group';
import { ILoggedUser, IUserGroup } from '@interface/authorization/user';
import { paginator } from '@common/helpers/custom.helper';
import { ISkillGroupModel } from '../schemas/skill-group.schema';
import { filterByAggregateName } from '@common/helpers/filter.helper';
import { USER_GROUP_TYPE } from '@constant/groups/groups';

@Injectable()
export class SkillGroupsDatabaseService extends CommonDatabaseService<ISkillGroup> {
  constructor(
    @InjectModel(DB_COLLECTION_NAMES.SKILL_GROUPS)
    private readonly skillGroupModel: Model<ISkillGroupModel>,
    @InjectModel(DB_COLLECTION_NAMES.USER_GROUPS)
    readonly userGroupModel: Model<IUserGroup>,
    logsDatabaseService: LogsDatabaseService,
  ) {
    super(
      logsDatabaseService,
      skillGroupModel,
      DB_COLLECTION_NAMES.SKILL_GROUPS,
    );
  }

  /**
   * This function filters skill group users, retrieves users associated with each skill group, and applies pagination.
   */
  async filterSingleSkillGroupUsers(
    searchKey: string,
    skillGroupId: Types.ObjectId,
    skip: number = 0,
    limit: number = 10,
  ): Promise<{
    data: { first_name: string; last_name: string; user_id: Types.ObjectId }[];
  }> {
    const [result] = await this.userGroupModel.aggregate([
      {
        $match: {
          group_id: new Types.ObjectId(skillGroupId),
          group_type: USER_GROUP_TYPE.SKILL_GROUP,
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
   * Get all skill groups where the user exists
   */
  async getUserSkillGroups(userId: string, searchKey: string) {
    const userObjectId = new Types.ObjectId(userId);

    const pipeline = [
      {
        $match: {
          user_id: userObjectId,
          group_type: USER_GROUP_TYPE.SKILL_GROUP,
        },
      },
      {
        $lookup: {
          from: DB_COLLECTION_NAMES.SKILL_GROUPS,
          localField: 'group_id',
          foreignField: '_id',
          as: 'skill_group',
        },
      },
      {
        $unwind: '$skill_group',
      },
      ...(searchKey
        ? [
            {
              $match: {
                'skill_group.name': {
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
          id: '$skill_group._id',
          name: '$skill_group.name',
        },
      },
    ];

    const userDesks = await this.userGroupModel.aggregate(pipeline);

    return userDesks;
  }

  /**
   * The function creates a new skill group using provided data and saves it to the database
   */
  async createNewSkillGroup(
    skillGroupData: Partial<ISkillGroup>,
    loggedUser: ILoggedUser,
  ): Promise<ISkillGroup | null> {
    try {
      const newSkillGroup = new this.skillGroupModel({
        ...skillGroupData,
        created_by: loggedUser._id,
      });

      const savedSkillGroup = await newSkillGroup.save();

      return savedSkillGroup.toObject({ versionKey: false });
    } catch (err) {
      new Logger().debug(
        `skill-group.database.service.ts -> createNewSkillGroup -> ${err}`,
        'DEBUG',
      );
      return null;
    }
  }

  async getGroupIdsAndReturnsNames(
    groupIds: string[],
  ): Promise<Partial<ISkillGroup[]>> {
    if (groupIds?.length === 0) return;
    const objectIds = groupIds.map((id) => new Types.ObjectId(id));
    const groups = await this.skillGroupModel
      .find({
        _id: { $in: objectIds },
        is_delete: false,
      })
      .select('name')
      .lean();

    return groups;
  }

  /**
   * This function updates a skill group document in a database based on the provided ID and
   * update data, with logging and validation, and returns the updated document or null.
   */
  async findSkillGroupByIdAndUpdate(
    id: Types.ObjectId,
    updateData: Partial<ISkillGroup>,
  ): Promise<ISkillGroup | null> {
    try {
      const updatedSkillGroup = await this.skillGroupModel.findByIdAndUpdate(
        id,
        updateData,
        {
          new: true,
          runValidators: true,
          lean: true,
        },
      );

      return updatedSkillGroup;
    } catch (err) {
      new Logger().debug(
        `skill-group.database.service.ts -> findSkillGroupByIdAndUpdate -> ${err}`,
        'DEBUG',
      );
      return null;
    }
  }

  /**
   * Adds a user to all active skill groups where they're not already present
   */
  async addUserToAllActiveSkillGroups(userId: Types.ObjectId) {
    try {
      // Find all non-deleted desks where the user isn't already present
      const updateResult = await this.skillGroupModel.updateMany(
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
        `skill-group.database.service.ts -> addUserToAllActiveSkillGroups -> ${err}`,
        'DEBUG',
      );
      return {
        success: false,
        error: err.message,
      };
    }
  }
}
