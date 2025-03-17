import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CommonDatabaseService } from '@common/services/common.database.service';
import { DB_COLLECTION_NAMES } from '@constant/common/db-collection-names';
import { ILoggedUser } from '@interface/authorization/user';
import { ISettingsModel } from '../schemas/settings.schema';
import { ISettings } from '@interface/settings/general-settings';

@Injectable()
export class GeneralSettingsDatabaseService extends CommonDatabaseService<ISettings> {
  constructor(
    @InjectModel(DB_COLLECTION_NAMES.SETTINGS)
    private readonly settingsModel: Model<ISettingsModel>,
  ) {
    super(settingsModel, DB_COLLECTION_NAMES.SETTINGS);
  }

  /**
   * The function creates a new settings with the provided data and the ID of the logged-in
   * user.
   */
  async createSettings(
    createData: Partial<ISettings>,
    loggedUser: ILoggedUser,
  ): Promise<ISettings | null> {
    try {
      const newReason = new this.settingsModel({
        ...createData,
        created_by: loggedUser._id,
      });

      const savedReason = await newReason.save();

      return savedReason.toObject({ versionKey: false });
    } catch (err) {
      new Logger().debug(
        `general-settings.database.service.ts -> createSettings -> ${err}`,
        'DEBUG',
      );
      return null;
    }
  }

  /*
   * This function updates existing general settings.
   */
  async updateSettings(
    id: Types.ObjectId,
    updateData: Partial<ISettings>,
    loggedUser: ILoggedUser,
  ): Promise<ISettings> {
    try {
      const settings = await this.settingsModel.findOneAndUpdate(
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

      return settings;
    } catch (err) {
      new Logger().debug(
        `general-settings.database.service.ts -> updateGeneralSettings -> ${err}`,
        'DEBUG',
      );
      return null;
    }
  }
}
