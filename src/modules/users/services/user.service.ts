import {
  DataToCheckDto,
  FilterUserMiscDataDto,
  FilterUsersDto,
  FilterUsersMetaDataDto,
} from '@dto/authorization/user-query-param.dto';
import { CreateUserDTO } from '@dto/authorization/user-request.dto';
import { Injectable, Logger } from '@nestjs/common';
import { FilterQuery, Types } from 'mongoose';
import { UsersDatabaseService } from './user.database.service';
import { IUser } from '@interface/authorization/user';
import { ACTIVE_STATE, MISC_TYPE } from '@constant/authorization/user';
import { DeleteRoleDTO } from '@dto/authorization/role-request.dto';
import { IRole } from '@interface/authorization/roles';
import { DesksDatabaseService } from '@module/groups/services/desk.database.service';
import { SkillGroupsDatabaseService } from '@module/groups/services/skill-group.database.service';
import { filterByName } from '@common/helpers/filter.helper';
import { UserGroupService } from '@module/groups/services/user-group.service';
import { USER_GROUP_TYPE } from '@constant/groups/groups';
import { GroupDatabaseService } from '@module/groups/services/group.database.service';

@Injectable()
export class UsersService {
  constructor(
    private readonly usersDatabaseService: UsersDatabaseService,
    private readonly userGroupService: UserGroupService,
    private readonly desksDatabaseService: DesksDatabaseService,
    private readonly skillGroupsDatabaseService: SkillGroupsDatabaseService,
    private readonly groupDatabaseService: GroupDatabaseService,
  ) {}

  /**
   * This function adds a user to all desks and skill groups based on the provided parameters.
   */
  async addUserToDesksAndSkillGroups(
    body: CreateUserDTO,
    user_id: Types.ObjectId,
  ) {
    try {
      // desks could be an array of desk ids or an array of desk names
      if (!body.add_to_currant_and_future_desks)
        await this.userGroupService.filterAndChangeUserGroups(
          user_id,
          body.desks,
          USER_GROUP_TYPE.DESK,
        );

      // skill_groups could be an array of skill group ids or an array of skill group names
      if (!body.add_to_currant_and_future_skill_groups)
        await this.userGroupService.filterAndChangeUserGroups(
          user_id,
          body.skill_groups,
          USER_GROUP_TYPE.SKILL_GROUP,
        );
    } catch (err) {
      new Logger().debug(
        `user.service.ts -> addUserToDesksAndSkillGroups -> ${err}`,
        'DEBUG',
      );
    }
  }

  /**
   * The function `getUserFilters` takes user filter parameters and constructs a MongoDB filter criteria
   * object based on the provided values.
   */
  getUserFilters(queryParams: FilterUsersDto): FilterQuery<FilterUsersDto> {
    const { email, username, role, name, _id, virtual_extension, searchKey } =
      queryParams;

    const filterCriteria: FilterQuery<FilterUsersDto> = {};

    if (email) {
      const regex = new RegExp(email, 'i');
      filterCriteria.email = { $regex: regex };
    }

    if (username) {
      const regex = new RegExp(username, 'i');
      filterCriteria.username = { $regex: regex };
    }

    if (role) filterCriteria.role = { $in: [role] };

    if (_id) filterCriteria._id = new Types.ObjectId(_id);

    if (virtual_extension) {
      const regex = new RegExp(virtual_extension.toString(), 'i');
      filterCriteria.virtual_extension = { $regex: regex };
    }

    if (name || searchKey) {
      //filter by first_name, last_name, full_name
      const searchTerm = name ?? searchKey;
      Object.assign(filterCriteria, filterByName(searchTerm));
    }

    filterCriteria.is_delete = false;

    return filterCriteria;
  }

  /*
   * The `getMetaFilters` function in the `UsersService` class is a method that takes user metadata filter
   * parameters and constructs a MongoDB filter criteria object based on the provided values.
   */
  getMetaFilters(filters: FilterUsersMetaDataDto): {
    filterCriteria: FilterQuery<FilterUsersDto>;
    deskIdsArray: Types.ObjectId[];
    skillGroupsIdsArray: Types.ObjectId[];
    groupsIdsArray: Types.ObjectId[];
  } {
    const filterCriteria: FilterQuery<FilterUsersDto> = {};
    let deskIdsArray = [];
    let skillGroupsIdsArray = [];
    let groupsIdsArray = [];

    filterCriteria.is_delete = false;

    if (filters.searchKey) {
      const regex = new RegExp(filters.searchKey, 'i');
      filterCriteria.$or = [
        { first_name: { $regex: regex } },
        { last_name: { $regex: regex } },
        { username: { $regex: regex } },
      ];
    }

    if (filters?.filter?.active_state) {
      const active_state = filters?.filter?.active_state;
      if (active_state === ACTIVE_STATE.ACTIVE) {
        filterCriteria.is_active = true;
      } else if (active_state === ACTIVE_STATE.DE_ACTIVE) {
        filterCriteria.is_active = false;
      } else {
        filterCriteria.is_active = { $in: [true, false] };
      }
    }

    if (
      filters?.filter?.sip_device &&
      filters?.filter?.sip_device?.length > 0
    ) {
      filterCriteria.sip_device = { $in: filters?.filter?.sip_device };
    }

    if (filters?.filter?.roleIds && filters?.filter?.roleIds?.length > 0) {
      const roleIdsArray = filters?.filter?.roleIds.map(
        (roleId) => new Types.ObjectId(roleId),
      );
      filterCriteria.role = { $in: roleIdsArray };
    }

    if (filters?.filter?.deskIds && filters?.filter?.deskIds?.length > 0)
      deskIdsArray = filters?.filter?.deskIds.map(
        (deskId) => new Types.ObjectId(deskId),
      );

    if (
      filters?.filter?.skillGroupIds &&
      filters?.filter?.skillGroupIds?.length > 0
    )
      skillGroupsIdsArray = filters?.filter?.skillGroupIds.map(
        (skillGroupId) => new Types.ObjectId(skillGroupId),
      );

    if (filters?.filter?.groupIds && filters?.filter?.groupIds?.length > 0)
      groupsIdsArray = filters?.filter?.groupIds.map(
        (groupId) => new Types.ObjectId(groupId),
      );

    return {
      filterCriteria,
      deskIdsArray,
      skillGroupsIdsArray,
      groupsIdsArray,
    };
  }

  /*
   * The `getUserRelatedData` function in the `UsersService` class is a method that fetches related data
   * for a user based on the provided `IUser` object and the `MISC_TYPE` enum.
   */
  async getUserRelatedData(userId: string, queryParams: FilterUserMiscDataDto) {
    if (queryParams.type === MISC_TYPE.DESK) {
      return await this.desksDatabaseService.getUserDesks(
        userId,
        queryParams.searchKey,
      );
    } else if (queryParams.type === MISC_TYPE.SKILL_GROUP) {
      return await this.skillGroupsDatabaseService.getUserSkillGroups(
        userId,
        queryParams.searchKey,
      );
    } else if (queryParams.type === MISC_TYPE.GROUP) {
      return await this.groupDatabaseService.getUserGroups(
        userId,
        queryParams.searchKey,
      );
    } else if (queryParams.type === MISC_TYPE.ROLE) {
      return await this.usersDatabaseService.getRolesByUserId(
        userId,
        queryParams.searchKey,
        queryParams.start,
        queryParams.size,
      );
    } else return null;
  }

  /**
   * This function returns the bulk operations associated with adding new roles to users
   */
  async updateUserRoles(
    usersWithRole: IUser[],
    actualUserRoles: Record<string, IRole | null>,
    deleteRoleDto: DeleteRoleDTO,
  ) {
    const bulkOperations = deleteRoleDto.usersAndNewRoles
      .map((userId) => {
        const user = usersWithRole.find(
          (userWithRole) => userWithRole._id.toString() == userId.user,
        );

        if (!user) return;

        const roles = userId.roles
          .map((role) => actualUserRoles[role]?._id)
          .filter((role) => role !== undefined && role !== null);

        const val = {
          updateOne: {
            filter: { _id: new Types.ObjectId(userId.user) },
            update: {
              $addToSet: { role: roles },
            },
            upsert: false,
          },
        };
        return val;
      })
      .filter((op) => op !== null && op !== undefined);

    if (bulkOperations.length)
      return await this.usersDatabaseService.bulkUpdateUserRoles(
        bulkOperations,
      );
  }

  createFindExistingUserFilter(dataToCheck: DataToCheckDto) {
    return {
      email: dataToCheck.email,
      username: dataToCheck.username,
    };
  }

  async getLoggedInAgents(pageIndex: number, pageSize: number) {
    const agents = await this.usersDatabaseService.findUsersByRole(
      pageIndex,
      pageSize,
    );

    return {
      agents: agents,
      last_updated: new Date(),
    };
    // return this.usersDatabaseService.findUsersByRole(pageIndex, pageSize);
  }
}
