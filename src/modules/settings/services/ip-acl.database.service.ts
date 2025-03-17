import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CommonDatabaseService } from '@common/services/common.database.service';
import { DB_COLLECTION_NAMES } from '@constant/common/db-collection-names';
import { LogsDatabaseService } from '@module/activity-logs/services/logs.database.service';
import { ILoggedUser } from '@interface/authorization/user';
import { IIpACL } from '@interface/settings/general-settings';
import { IIpACLModel } from '../schemas/ip-acl.schema';

@Injectable()
export class IpACLDatabaseService extends CommonDatabaseService<IIpACL> {
  constructor(
    @InjectModel(DB_COLLECTION_NAMES.IP_ACL)
    readonly ipACLModel: Model<IIpACLModel>,
    logsDatabaseService: LogsDatabaseService,
  ) {
    super(logsDatabaseService, ipACLModel, DB_COLLECTION_NAMES.IP_ACL);
  }

  /**
   * The function creates a ip-acl with the provided data and the ID of the logged-in user.
   */
  async createNewIpACL(
    createData: Partial<IIpACL>,
    loggedUser: ILoggedUser,
  ): Promise<IIpACL | null> {
    try {
      const newIpACL = new this.ipACLModel({
        ...createData,
        created_by: loggedUser._id,
      });

      const savedIpACL = await newIpACL.save();

      return savedIpACL.toObject({ versionKey: false });
    } catch (err) {
      new Logger().debug(
        `ip-acl.database.service.ts -> createNewIpACL -> ${err}`,
        'DEBUG',
      );
      return null;
    }
  }

  /**
   * This function updates a ip-acl document in a MongoDB collection based on the provided ID
   * and update data, with validation and logging information.
   */
  async findIpACLByIdAndUpdate(
    id: Types.ObjectId,
    updateData: Partial<IIpACL>,
    loggedUser: ILoggedUser,
  ): Promise<IIpACL | null> {
    try {
      const updatedReason = await this.ipACLModel.findByIdAndUpdate(
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
      return updatedReason;
    } catch (err) {
      new Logger().debug(
        `ip-acl.database.service.ts -> findIpACLByIdAndUpdate -> ${err}`,
        'DEBUG',
      );
      return null;
    }
  }
}
