import {
  Injectable,
  Logger,
  UnprocessableEntityException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, PipelineStage, Types } from 'mongoose';
import { CommonDatabaseService } from '@common/services/common.database.service';
import { DB_COLLECTION_NAMES } from '@constant/common/db-collection-names';
import { LogsDatabaseService } from '@module/activity-logs/services/logs.database.service';
import { ILoggedUser } from '@interface/authorization/user';
import { IRole } from '@interface/authorization/roles';
import { IRoleModel } from '../schemas/roles.schema';
import { PERMISSIONS } from '@constant/authorization/roles';
import { SYSTEM_CHANGES } from '@constant/common/system-changes';
import { RESPONSE_MESSAGES } from '@constant/common/responses';

@Injectable()
export class RolesDatabaseService extends CommonDatabaseService<IRole> {
  constructor(
    @InjectModel(DB_COLLECTION_NAMES.ROLES)
    private readonly roleModel: Model<IRoleModel>,
    logsDatabaseService: LogsDatabaseService,
  ) {
    super(logsDatabaseService, roleModel, DB_COLLECTION_NAMES.ROLES);
  }

  /**
   * This function filters roles based on a given role name with optional pagination parameters.
   */
  async getUniquePermissionList(roleIds: Types.ObjectId[]) {
    try {
      const roles: IRole[] = await this.roleModel
        .find({ _id: { $in: roleIds } })
        .exec();

      const permissions: PERMISSIONS[] =
        roles.length > 0
          ? [...new Set(roles.flatMap((role) => role.permissions))]
          : [];

      return permissions;
    } catch (error) {
      new Logger().debug(
        `roles.database.service.ts -> getUniquePermissionList -> ${error}`,
        'DEBUG',
      );
      throw new UnprocessableEntityException([
        RESPONSE_MESSAGES.DATA_NOT_FOUND,
      ]);
    }
  }

  /**
   * This function receives the roles ids and return the corresponding array of those roles's names
   */
  async getRoleIdsAndReturnsNames(
    roleIds: string[],
  ): Promise<Partial<IRole[]>> {
    if (roleIds?.length === 0) return;

    const objectIds = roleIds.map((id) => new Types.ObjectId(id));
    const roles = await this.roleModel
      .find({
        _id: { $in: objectIds },
        is_delete: false,
      })
      .select('role')
      .lean();

    return roles;
  }

  /**
   * This function lists all roles in the system.
   */
  async listAllRoles(
    id: string,
  ): Promise<{ data: { _id: string; role: string }[] }> {
    const aggregationPipeline: PipelineStage[] = [
      {
        $match: {
          _id: { $nin: [new Types.ObjectId(id)] },
        },
      },
      { $match: { is_delete: false } },
      {
        $project: {
          role: 1,
          _id: 1,
        },
      },
    ];

    const result = await this.roleModel.aggregate(aggregationPipeline);

    // Return the data and count in the common format
    return { data: result ?? [] };
  }

  /**
   * This function filters roles based on a given role name with optional pagination parameters.
   */
  async createNewRole(
    roleData: Partial<IRole>,
    loggedUser?: ILoggedUser,
  ): Promise<IRole> {
    const newReason = new this.roleModel({
      ...roleData,
      created_by: loggedUser?._id ?? SYSTEM_CHANGES.SYSTEM,
    });

    const savedReason = await newReason.save();

    return savedReason.toObject({ versionKey: false });
  }

  /**
   * This function filters roles based on a given role name with optional pagination parameters.
   */
  async findRoleByIdAndUpdate(
    id: Types.ObjectId,
    updateData: Partial<IRole>,
    loggedUser: ILoggedUser,
  ): Promise<IRole | null> {
    try {
      const updatedRole = await this.roleModel.findByIdAndUpdate(
        id,
        {
          $set: {
            ...updateData,
            changed_by: loggedUser._id,
            last_modified_on: new Date(),
          },
        },
        {
          new: true,
          runValidators: true,
          lean: true,
        },
      );

      return updatedRole;
    } catch (err) {
      new Logger().debug(
        `roles.database.service.ts -> findRoleByIdAndUpdate -> ${err}`,
        'DEBUG',
      );
      return null;
    }
  }

  /**
   * This function changes the is_delete property of a given role to the value true
   */
  async deleteRole(role: IRole) {
    try {
      const result = await this.roleModel.findByIdAndUpdate(
        role._id,
        {
          $set: {
            is_delete: true,
          },
        },
        {
          new: true,
        },
      );

      if (!result.is_delete) throw new Error(RESPONSE_MESSAGES.DB_FAILURE);

      return result;
    } catch (err) {
      new Logger().debug(
        `roles.database.service.ts -> deleteRole -> ${err}`,
        'DEBUG',
      );
      throw new Error(RESPONSE_MESSAGES.DB_FAILURE);
    }
  }

  //the following function create multiple roles on module initiation
  async createMultipleRoles(rolesToCreate: IRole[]): Promise<IRole[]> {
    try {
      const result = await this.roleModel.insertMany(rolesToCreate);
      return result as IRole[];
    } catch (err) {
      new Logger().debug(
        `roles.database.service.ts -> createMultipleRoles -> ${err}`,
        'DEBUG',
      );
      throw new Error(RESPONSE_MESSAGES.DB_FAILURE);
    }
  }

  async findRoleIdByName(roleName: string): Promise<Types.ObjectId> {
    try {
      const role = await this.roleModel
        .findOne({ role: roleName })
        .select('_id')
        .lean();

      if (!role) {
        new Logger().warn(`Role not found: ${roleName}`);
        return null;
      }

      new Logger().log(`Found role ID: ${role._id} for role: ${roleName}`);
      return role._id;
    } catch (error) {
      new Logger().error(`Error fetching role ID for ${roleName}:`, error);
      throw new Error('Failed to fetch role ID');
    }
  }
}
