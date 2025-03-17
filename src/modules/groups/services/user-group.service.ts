import { DB_COLLECTION_NAMES } from '@constant/common/db-collection-names';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { IUserGroupModel } from '../schemas/user-group.schema';
import { IUserGroup } from '@interface/authorization/user';
import { USER_GROUP_TYPE } from '@constant/groups/groups';

@Injectable()
export class UserGroupService {
  constructor(
    @InjectModel(DB_COLLECTION_NAMES.USER_GROUPS)
    private readonly userGroupModel: Model<IUserGroupModel>,
  ) {}

  async createGroupUser(
    createUserGroupDto: IUserGroup,
  ): Promise<IUserGroupModel> {
    const newUserGroup = new this.userGroupModel({
      ...createUserGroupDto,
      created_at: new Date(),
      updated_at: new Date(),
    });
    return await newUserGroup.save();
  }

  async bulkCreateGroupUsers(
    users: Types.ObjectId[],
    group_id: Types.ObjectId,
    group_type: USER_GROUP_TYPE,
  ): Promise<IUserGroupModel[]> {
    const userGroups = users.map((user) => ({
      user_id: user,
      group_id,
      group_type,
    }));

    return await this.userGroupModel.insertMany(userGroups);
  }

  async filterAndChangeUserGroup(
    userIds: string[],
    groupObjectId: Types.ObjectId,
    group_type: USER_GROUP_TYPE,
    isDelete: boolean = false,
  ): Promise<{
    created: IUserGroupModel[];
    removed: IUserGroupModel[];
    kept: IUserGroupModel[];
  }> {
    //TODO: add try catch block
    if (isDelete) {
      await this.userGroupModel
        .deleteMany({
          group_id: groupObjectId,
        })
        .exec();
      return {
        created: [],
        removed: [],
        kept: [],
      };
    }

    // Convert string IDs to ObjectIds
    const userObjectIds = userIds.map((id) => new Types.ObjectId(id));

    // Find existing user-group relations for this group
    const existingUserGroups = await this.userGroupModel
      .find({
        group_id: groupObjectId,
      })
      .exec();

    // Extract existing user IDs for comparison
    const existingUserIds = existingUserGroups.map((ug) => ug.user_id);

    // Identify users to add (in userIds but not in existingUserIds)
    const usersToAdd = userObjectIds.filter(
      (id) => !existingUserIds.includes(id),
    );

    // Identify user groups to remove (users in existingUserIds but not in userIds)
    const userGroupsToRemove = existingUserGroups.filter(
      (ug) => !userObjectIds.includes(ug.user_id),
    );

    // Identify user groups to keep
    const userGroupsToKeep = existingUserGroups.filter((ug) =>
      userObjectIds.includes(ug.user_id),
    );

    // Create new user groups
    const newUserGroups = await Promise.all(
      usersToAdd.map(async (userId) => {
        return this.createGroupUser({
          user_id: userId,
          group_id: groupObjectId,
          group_type: group_type,
        });
      }),
    );

    // Hard delete user groups that need to be removed
    const removedUserGroups = [...userGroupsToRemove]; // Save a copy before deletion

    if (userGroupsToRemove.length > 0) {
      await this.userGroupModel
        .deleteMany({
          _id: { $in: userGroupsToRemove.map((ug) => ug._id) },
        })
        .exec();
    }

    return {
      created: newUserGroups,
      removed: removedUserGroups,
      kept: userGroupsToKeep,
    };
  }

  async filterAndChangeUserGroups(
    userObjectId: Types.ObjectId,
    groupIds: string[],
    group_type: USER_GROUP_TYPE,
  ): Promise<{
    created: IUserGroupModel[];
    removed: IUserGroupModel[];
    kept: IUserGroupModel[];
  }> {
    try {
      const groupObjectIds = groupIds.map((id) => new Types.ObjectId(id));

      // Find existing user-group relations for this user and group type
      const existingUserGroups = await this.userGroupModel
        .find({
          user_id: userObjectId,
          group_type: group_type,
        })
        .exec();

      // Extract existing group IDs for comparison
      const existingGroupIds = existingUserGroups.map((ug) =>
        ug.group_id.toString(),
      );

      // Identify groups to add (in groupIds but not in existingGroupIds)
      const groupsToAdd = groupObjectIds.filter(
        (id) => !existingGroupIds.includes(id.toString()),
      );

      // Identify user groups to remove (groups in existingGroupIds but not in groupIds)
      const userGroupsToRemove = existingUserGroups.filter(
        (ug) => !groupIds.includes(ug.group_id.toString()),
      );

      // Identify user groups to keep
      const userGroupsToKeep = existingUserGroups.filter((ug) =>
        groupIds.includes(ug.group_id.toString()),
      );

      // Create new user groups in bulk
      const newUserGroups = await this.userGroupModel.insertMany(
        groupsToAdd.map((groupId) => ({
          user_id: userObjectId,
          group_id: groupId,
          group_type: group_type,
        })),
      );

      // Remove user groups that are no longer needed
      const removedUserGroups = [...userGroupsToRemove]; // Save a copy before deletion

      if (userGroupsToRemove.length > 0) {
        await this.userGroupModel
          .deleteMany({
            _id: { $in: userGroupsToRemove.map((ug) => ug._id) },
          })
          .exec();
      }

      return {
        created: newUserGroups,
        removed: removedUserGroups,
        kept: userGroupsToKeep,
      };
    } catch (error) {
      throw new Error(`Failed to update user groups: ${error.message}`);
    }
  }

  async removeUserFromAllGroups(userID: Types.ObjectId): Promise<number> {
    //TODO: add try catch block
    const result = await this.userGroupModel
      .deleteMany({
        user_id: userID,
      })
      .exec();

    return result.deletedCount;
  }

  async countUsersByGroupIds(groupIds: string[]) {
    const groupObjectIds = groupIds.map((id) => new Types.ObjectId(id));

    const pipeline = [
      {
        $match: {
          group_id: { $in: groupObjectIds },
        },
      },
      {
        $group: {
          _id: '$group_id',
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: { $toString: '$_id' },
          count: 1,
        },
      },
    ];

    return await this.userGroupModel.aggregate(pipeline);
  }
}
