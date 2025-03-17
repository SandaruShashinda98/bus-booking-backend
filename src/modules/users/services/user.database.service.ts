import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  FilterQuery,
  Model,
  PipelineStage,
  Types,
  UpdateQuery,
} from 'mongoose';
import { IUserModel } from '../schemas/user.schema';
import * as bcrypt from 'bcrypt';
import { CommonDatabaseService } from '@common/services/common.database.service';
import { DB_COLLECTION_NAMES } from '@constant/common/db-collection-names';
import { LogsDatabaseService } from '@module/activity-logs/services/logs.database.service';
import { AuthService } from '@module/authentication/services/auth.service';
import { RolesDatabaseService } from '@module/roles/services/roles.database.service';
import { SYSTEM_CHANGES } from '@constant/common/system-changes';
import { RESPONSE_MESSAGES } from '@constant/common/responses';
import { IRole } from '@interface/authorization/roles';
import { paginator, responseOrderMaker } from '@common/helpers/custom.helper';
import { IUser } from '@interface/authorization/user';
import { DEFINITE_ROLES } from '@config/util/roles.config';
import { RolesService } from '@module/roles/services/roles.service';

@Injectable()
export class UsersDatabaseService extends CommonDatabaseService<IUser> {
  constructor(
    private readonly rolesDatabaseService: RolesDatabaseService,
    private readonly rolesService: RolesService,
    @InjectModel(DB_COLLECTION_NAMES.USERS)
    private readonly userModel: Model<IUserModel>,
    logsDatabaseService: LogsDatabaseService,
    private readonly authService: AuthService,
  ) {
    super(logsDatabaseService, userModel, DB_COLLECTION_NAMES.USERS);
  }

  //TODO : @Sandaru - REMOVE THIS AFTER DEV PROCESS
  async onModuleInit() {
    // find or create default role

    let roles: IRole[] | IRole =
      await this.rolesDatabaseService.filterDocuments({
        role: DEFINITE_ROLES,
      });

    if (!Array.isArray(roles)) roles = [roles];

    if (roles.length !== DEFINITE_ROLES.length) {
      const createdRoles = await this.rolesDatabaseService.createMultipleRoles(
        this.rolesService.createDefiniteRoles(roles, DEFINITE_ROLES),
      );
      Array.prototype.push.apply(roles, createdRoles);
      new Logger().log('Admin role created', 'NestApplication');
    } else {
      new Logger().log('Admin role available', 'NestApplication');
    }

    // find or create default admin user
    const adminUser = await this.findDocument({ username: 'admin' });

    if (!adminUser) {
      await this.createUser(
        {
          email: 'admin@example.com',
          first_name: 'Admin',
          last_name: 'User',
          username: 'admin',
          role: [roles.find((role) => role.role === 'Admin')?._id].filter(
            Boolean,
          ),
          created_by: SYSTEM_CHANGES.SYSTEM,
        },
        'admin123', //password
      );
      new Logger().log('Admin user created', 'NestApplication');
    } else {
      new Logger().log('Admin user available', 'NestApplication');
    }
  }

  /**
   * This function filters users based on specified criteria with optional pagination parameters.
   */
  async filterUsersWithMetaData(
    filters: {
      filterCriteria: FilterQuery<any>;
      deskIdsArray: Types.ObjectId[];
      skillGroupsIdsArray: Types.ObjectId[];
      groupsIdsArray: Types.ObjectId[];
    },
    skip: number = 0,
    limit: number = 10,
  ) {
    const {
      filterCriteria,
      // UPCOMING
      // deskIdsArray = [],
      // skillGroupsIdsArray = [],
      // groupsIdsArray = [],
    } = filters;
    // UPCOMING
    // const groupIds = [
    //   ...deskIdsArray,
    //   ...skillGroupsIdsArray,
    //   ...groupsIdsArray,
    // ];

    const aggregationPipeline: PipelineStage[] = [
      { $match: filterCriteria },

      { $sort: { created_on: -1 } },
      // UPCOMING
      // {
      //   $lookup: {
      //     from: DB_COLLECTION_NAMES.USER_GROUPS,
      //     let: { userId: '$_id' },
      //     pipeline: [
      //       {
      //         $match: {
      //           $expr: {
      //             $and: [
      //               { $eq: ['$user_id', '$$userId'] },
      //               ...(groupIds.length > 0
      //                 ? [{ $in: ['$group_id', groupIds] }]
      //                 : []),
      //             ],
      //           },
      //         },
      //       },
      //       {
      //         $project: {
      //           id: '$_id',
      //           group_id: 1,
      //           group_type: 1,
      //           _id: 0,
      //         },
      //       },
      //     ],
      //     as: 'allGroups',
      //   },
      // },

      // UPCOMING
      // Apply group filters if any groups are specified
      // ...(groupIds.length > 0
      //   ? [
      //       {
      //         $match: {
      //           'allGroups.0': { $exists: true },
      //         },
      //       },
      //     ]
      //   : []),

      // Project the final format with separated group types
      {
        $project: {
          _id: 1,
          first_name: 1,
          last_name: 1,
          email: 1,
          username: 1,
          virtual_extension: 1,
          add_to_currant_and_future_desks: 1,
          add_to_currant_and_future_skill_groups: 1,
          is_assign_leads: 1,
          sip_setting: 1,
          two_factor_authentication_type: 1,
          max_concurrent_sessions: 1,
          devices: 1,
          is_active: 1,
          role: 1,
          // UPCOMING
          // desks: {
          //   $map: {
          //     input: {
          //       $filter: {
          //         input: '$allGroups',
          //         as: 'group',
          //         cond: { $eq: ['$$group.group_type', USER_GROUP_TYPE.DESK] },
          //       },
          //     },
          //     as: 'deskGroup',
          //     in: '$$deskGroup.group_id',
          //   },
          // },
          // skill_groups: {
          //   $map: {
          //     input: {
          //       $filter: {
          //         input: '$allGroups',
          //         as: 'group',
          //         cond: {
          //           $eq: ['$$group.group_type', USER_GROUP_TYPE.SKILL_GROUP],
          //         },
          //       },
          //     },
          //     as: 'skillGroup',
          //     in: '$$skillGroup.group_id',
          //   },
          // },
          // groups: {
          //   $map: {
          //     input: {
          //       $filter: {
          //         input: '$allGroups',
          //         as: 'group',
          //         cond: { $eq: ['$$group.group_type', USER_GROUP_TYPE.GROUP] },
          //       },
          //     },
          //     as: 'generalGroup',
          //     in: '$$generalGroup.group_id',
          //   },
          // },
          last_login: 1,
        },
      },

      // Facet for pagination
      {
        $facet: {
          data: [...paginator(skip, limit)],
          count: [{ $count: 'total' }],
        },
      },
    ];

    const result = await this.userModel.aggregate(aggregationPipeline);

    return {
      data: result[0].data ?? [],
      count: result[0].count[0] ? result[0].count[0].total : 0,
    };
  }

  /**
   * This function find a specific user by _id and returns data with meta data.
   */
  async getSingleUserWithMetaData(userId: string) {
    const aggregationPipeline: PipelineStage[] = [
      {
        $match: {
          _id: new Types.ObjectId(userId),
        },
      },
      // UPCOMING
      // {
      //   $lookup: {
      //     from: DB_COLLECTION_NAMES.USER_GROUPS,
      //     let: { userId: '$_id' },
      //     pipeline: [
      //       {
      //         $match: {
      //           $expr: {
      //             $and: [
      //               { $eq: ['$user_id', '$$userId'] },
      //               { $eq: ['$group_type', USER_GROUP_TYPE.DESK] },
      //             ],
      //           },
      //         },
      //       },
      //       {
      //         $project: {
      //           _id: 0,
      //           group_id: 1,
      //         },
      //       },
      //     ],
      //     as: 'desks',
      //   },
      // },
      // {
      //   $lookup: {
      //     from: DB_COLLECTION_NAMES.USER_GROUPS,
      //     let: { userId: '$_id' },
      //     pipeline: [
      //       {
      //         $match: {
      //           $expr: {
      //             $and: [
      //               { $eq: ['$user_id', '$$userId'] },
      //               { $eq: ['$group_type', USER_GROUP_TYPE.SKILL_GROUP] },
      //             ],
      //           },
      //         },
      //       },
      //       {
      //         $project: {
      //           _id: 0,
      //           group_id: 1,
      //         },
      //       },
      //     ],
      //     as: 'skill_groups',
      //   },
      // },
      {
        $project: {
          _id: 1,
          is_active: 1,
          first_name: 1,
          last_name: 1,
          email: 1,
          username: 1,
          add_to_currant_and_future_desks: 1,
          add_to_currant_and_future_skill_groups: 1,
          is_assign_leads: 1,
          virtual_extension: 1,
          sip_setting: 1,
          two_factor_authentication_type: 1,
          max_concurrent_sessions: 1,
          devices: 1,
          roles: '$role',
          // UPCOMING
          // desks: '$desks.group_id',
          // skill_groups: '$skill_groups.group_id',
        },
      },
    ];

    const [result] = await this.userModel.aggregate(aggregationPipeline, {
      allowDiskUse: true,
    });

    return result || null;
  }

  async getRolesByUserId(
    userId: string,
    searchKey?: string,
    skip: number = 0,
    limit: number = 10,
  ) {
    const userObjectId = new Types.ObjectId(userId);
    const aggregationPipeline: PipelineStage[] = [
      {
        $match: {
          _id: userObjectId,
        },
      } as PipelineStage,
      {
        $unwind: '$role',
      } as PipelineStage,
      {
        $lookup: {
          from: 'roles',
          localField: 'role',
          foreignField: '_id',
          as: 'roleData',
        },
      } as PipelineStage,
      {
        $unwind: '$roleData',
      } as PipelineStage,
    ];

    if (searchKey) {
      aggregationPipeline.push({
        $match: {
          'roleData.role': {
            $regex: new RegExp(searchKey.trim(), 'i'),
          },
        },
      } as PipelineStage);
    }

    aggregationPipeline.push(...paginator(skip, limit));

    aggregationPipeline.push({
      $project: {
        id: '$roleData._id',
        name: '$roleData.role',
        _id: 0,
      },
    } as PipelineStage);

    return await this.userModel.aggregate(aggregationPipeline);
  }

  /**
   * This function receives the user ids and return the corresponding array of those user's first names and last names
   */
  async getUserIdsAndReturnsNames(
    userIds: string[],
  ): Promise<Partial<IUser>[]> {
    if (userIds?.length === 0) return;

    const objectIds = userIds.map((id) => new Types.ObjectId(id));
    const users = await this.userModel
      .find({
        _id: { $in: objectIds },
        is_delete: false,
      })
      .select('first_name last_name')
      .lean();

    return users;
  }

  /**
   * The function `createUser` creates a new user, saves the user data, hashes the password, and
   * creates an authentication credential.
   */
  async createUser(userData: Partial<IUser>, password: string): Promise<IUser> {
    try {
      const user = new this.userModel(userData);
      const savedUser = (await user.save()).toObject();
      const hashedPassword = await bcrypt.hash(password, 10);

      await this.authService.createAuthCredential(savedUser, hashedPassword);

      return savedUser;
    } catch (err) {
      new Logger().debug(
        `user.database.service.ts -> createUser -> ${err}`,
        'DEBUG',
      );
      return null;
    }
  }

  /**
   * This function updates a user in a database using the provided user ID and update data.
   */
  async updateUser(
    userId: string,
    updateUserDto: Partial<IUser>,
  ): Promise<IUser> {
    try {
      const updatedUser = await this.userModel
        .findByIdAndUpdate(
          userId,
          { $set: updateUserDto },
          { new: true, runValidators: true },
        )
        .exec();

      return updatedUser;
    } catch (err) {
      new Logger().debug(
        `user.database.service.ts -> updateUser -> ${err}`,
        'DEBUG',
      );
      return null;
    }
  }

  /**
   * This function gets the user details such as _id, first_name, last_name and email or
   * users of a given user role id
   */
  async getUsersOfRole(
    id: Types.ObjectId,
    skip: number = 0,
    limit: number = 10,
  ) {
    const aggregationPipeline: PipelineStage[] = [
      {
        $match: {
          role: id,
          is_delete: false,
        },
      },
      {
        $facet: {
          data: [
            ...paginator(skip, limit),
            {
              $project: {
                _id: 1,
                first_name: 1,
                last_name: 1,
                email: 1,
              },
            },
          ],
          count: [{ $count: 'total' }],
        },
      },
    ];

    const result = await this.userModel.aggregate(aggregationPipeline);

    return {
      data: result[0].data ?? [],
      count: result[0].count[0] ? result[0].count[0].total : 0,
    };
  }

  /**
   * This function fetches the Users with the given Role
   */
  async findUsersWithRole(id: Types.ObjectId): Promise<IUser[]> {
    return await this.userModel.find({ role: id });
  }

  /**
   * This function performs a bulk write operation to the user documents
   */
  async bulkUpdateUserRoles(bulkOperations: any) {
    try {
      return await this.userModel.bulkWrite(bulkOperations);
    } catch {
      throw new Error(RESPONSE_MESSAGES.DB_FAILURE);
    }
  }

  /**
   * The function removes the given role from the given users
   */
  async deleteRoleFromUsers(usersWithRole: IUser[], foundRole: IRole) {
    const userIds = usersWithRole.map((user) => user._id);
    try {
      return await this.userModel.updateMany(
        {
          _id: { $in: userIds },
        },
        { $pull: { role: foundRole._id } },
      );
    } catch {
      throw new Error(RESPONSE_MESSAGES.DB_FAILURE);
    }
  }

  async findUserExistence(
    searchFilter: { username?: string; email?: string },
    id?: string,
  ) {
    try {
      const aggregationPipeline: PipelineStage[] = [
        {
          $match: {
            $and: [
              {
                $or: [
                  { username: searchFilter.username },
                  { email: searchFilter.email },
                ],
              },
              ...(id ? [{ _id: { $ne: new Types.ObjectId(id) } }] : []),
            ],
          },
        },
      ];

      return await this.userModel.aggregate(aggregationPipeline);
    } catch (err) {
      new Logger().debug(
        `user.database.service.ts -> findUserExistence -> ${err}`,
        'DEBUG',
      );
      return null;
    }
  }

  async updateMany(
    filter: FilterQuery<IUserModel>,
    update: UpdateQuery<IUserModel>,
  ): Promise<boolean> {
    try {
      const result = await this.userModel.updateMany(filter, update);
      return result.modifiedCount > 0;
    } catch (error) {
      new Logger().debug(
        `users.database.service.ts -> updateMany -> ${error}`,
        'DEBUG',
      );
      return false;
    }
  }

  async findUsersWithRoleName(roleName: string) {
    try {
      const role = await this.rolesDatabaseService.findDocument({
        role: roleName,
      });

      if (!role)
        throw new NotFoundException([RESPONSE_MESSAGES.DATA_NOT_FOUND]);

      const users = await this.findUsersWithRole(role._id);

      return users;
    } catch (err) {
      new Logger().debug(
        `users.database.service.ts -> findUsersWithRoleName -> ${err}`,
        'DEBUG',
      );
      throw err;
    }
  }

  async findUsersByRole(
    skip: number,
    limit: number,
  ): Promise<{ data: any[]; count: number }> {
    try {
      const roleId = await this.rolesDatabaseService.findRoleIdByName('Agent');
      if (!roleId) {
        new Logger().warn('Role ID not found for Agent');
        throw new Error('Role ID not found');
      }

      const aggregationPipeline: PipelineStage[] = [
        { $match: { role: roleId } },
        {
          $facet: {
            data: [
              { $sort: { created_on: -1 } },
              ...paginator(skip, limit),
              {
                $project: {
                  _id: 1,
                  name: { $concat: ['$first_name', ' ', '$last_name'] },
                  status: { $ifNull: ['$status', 'N/A'] },
                  state_duration: {
                    $let: {
                      vars: {
                        diffInSeconds: {
                          $dateDiff: {
                            startDate: '$status_changed_at',
                            endDate: '$$NOW',
                            unit: 'second',
                          },
                        },
                      },
                      in: {
                        $concat: [
                          {
                            $toString: {
                              $floor: { $divide: ['$$diffInSeconds', 3600] },
                            },
                          },
                          'h ',
                          {
                            $toString: {
                              $floor: {
                                $mod: [
                                  { $divide: ['$$diffInSeconds', 60] },
                                  60,
                                ],
                              },
                            },
                          },
                          'm ',
                          { $toString: { $mod: ['$$diffInSeconds', 60] } },
                          's',
                        ],
                      },
                    },
                  },
                  average_idle_time: { $literal: '12.8(79.74s)' },
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

      const result = await this.userModel.aggregate(aggregationPipeline);
      return {
        data: responseOrderMaker(skip, limit, result[0].data, result[0].count),
        count: result[0].count,
      };
    } catch (error) {
      new Logger().error('Error fetching users by role:', error);
      return { data: [], count: 0 };
    }
  }
}
