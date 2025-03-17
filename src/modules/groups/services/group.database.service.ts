import { CommonDatabaseService } from '@common/services/common.database.service';
import { IGroup } from '@interface/groups/groups';
import { Injectable, Logger } from '@nestjs/common';
import { IGroupModel } from '../schemas/group.schema';
import { LogsDatabaseService } from '@module/activity-logs/services/logs.database.service';
import { InjectModel } from '@nestjs/mongoose';
import { DB_COLLECTION_NAMES } from '@constant/common/db-collection-names';
import { Model, Types } from 'mongoose';
import { ILoggedUser, IUserGroup } from '@interface/authorization/user';
import { USER_GROUP_TYPE } from '@constant/groups/groups';

@Injectable()
export class GroupDatabaseService extends CommonDatabaseService<IGroup> {
  constructor(
    @InjectModel(DB_COLLECTION_NAMES.GROUPS)
    private readonly groupModel: Model<IGroupModel>,

    @InjectModel(DB_COLLECTION_NAMES.USER_GROUPS)
    readonly userGroupModel: Model<IUserGroup>,
    logsDatabaseService: LogsDatabaseService,
  ) {
    super(logsDatabaseService, groupModel, DB_COLLECTION_NAMES.GROUPS);
  }

  /**
   * The function creates a new group using provided data and saves it to the database
   */
  async createNewGroup(
    groupData: Partial<IGroup>,
    loggedUser: ILoggedUser,
  ): Promise<IGroup | null> {
    try {
      const newGroup = new this.groupModel({
        ...groupData,
        created_by: loggedUser._id,
      });

      const savedGroup = await newGroup.save();

      return savedGroup.toObject({ versionKey: false });
    } catch (err) {
      new Logger().debug(
        `group.database.service.ts -> createNewGroup -> ${err}`,
        'DEBUG',
      );
      return null;
    }
  }

  async findGroupByIdAndUpdate(
    id: Types.ObjectId,
    updateData: Partial<IGroup>,
  ): Promise<IGroup | null> {
    try {
      const updatedSkillGroup = await this.groupModel.findByIdAndUpdate(
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

  async getGroupIdsAndReturnsNames(
    groupIds: string[],
  ): Promise<Partial<IGroup[]>> {
    if (groupIds?.length === 0) return;
    const objectIds = groupIds.map((id) => new Types.ObjectId(id));
    const groups = await this.groupModel
      .find({
        _id: { $in: objectIds },
        is_delete: false,
      })
      .select('name')
      .lean();

    return groups;
  }

  async getUserGroups(userId: string, searchKey: string) {
    const userObjectId = new Types.ObjectId(userId);

    const pipeline = [
      {
        $match: {
          user_id: userObjectId,
          group_type: USER_GROUP_TYPE.GROUP,
        },
      },
      {
        $lookup: {
          from: DB_COLLECTION_NAMES.GROUPS,
          localField: 'group_id',
          foreignField: '_id',
          as: 'group',
        },
      },
      {
        $unwind: '$group',
      },
      ...(searchKey
        ? [
            {
              $match: {
                'group.name': {
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
          id: '$group._id',
          name: '$group.name',
        },
      },
    ];

    const userDesks = await this.userGroupModel.aggregate(pipeline);

    return userDesks;
  }

  async assignGroupToSkillGroup(body: {
    group_id: string;
    skill_group_id: string;
  }): Promise<any> {
    const { group_id, skill_group_id } = body;

    try {
      // Convert string IDs to ObjectIDs if needed
      const groupObjectId = new Types.ObjectId(group_id);
      const skillGroupObjectId = new Types.ObjectId(skill_group_id);

      // Find all documents with given group_id and SKILL_GROUP type
      const skillGroupUsers = await this.userGroupModel
        .find({
          group_id: skillGroupObjectId,
          group_type: USER_GROUP_TYPE.SKILL_GROUP,
        })
        .lean();

      if (skillGroupUsers.length === 0) {
        return;
      }

      // Bulk operations for creating new documents
      const bulkOps = skillGroupUsers.map((user) => ({
        insertOne: {
          document: {
            user_id: user.user_id,
            group_id: groupObjectId,
            group_type: USER_GROUP_TYPE.GROUP,
          },
        },
      }));

      // Execute bulk write operation
      if (bulkOps.length > 0) {
        await this.userGroupModel.bulkWrite(bulkOps, { ordered: false });
      }

      return {
        success: true,
        message: `Successfully assigned group to skill group`,
      };
    } catch (error) {
      new Logger().error(
        `group.database.service.ts -> assignGroupToSkillGroup -> ${error}`,
        'ERROR',
      );
      return null;
    }
  }
}
