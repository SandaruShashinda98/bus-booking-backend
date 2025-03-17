import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CommonDatabaseService } from '@common/services/common.database.service';
import { DB_COLLECTION_NAMES } from '@constant/common/db-collection-names';
import { ILoggedUser } from '@interface/authorization/user';
import { IClockOutReason } from '@interface/references/reference';
import { IClockOutReasonModel } from '../schemas/clock-out-reason.schema';

@Injectable()
export class ClockOutReasonDatabaseService extends CommonDatabaseService<IClockOutReason> {
  constructor(
    @InjectModel(DB_COLLECTION_NAMES.CLOCK_OUT_REASONS)
    readonly clockOutReasonModel: Model<IClockOutReasonModel>,
  ) {
    super(clockOutReasonModel, DB_COLLECTION_NAMES.CLOCK_OUT_REASONS);
  }

  /**
   * The function creates a new clock out reason with the provided data and the ID of the logged-in
   * user.
   */
  async createNewClockOutReason(
    reasonData: Partial<IClockOutReason>,
    loggedUser: ILoggedUser,
  ): Promise<IClockOutReason | null> {
    try {
      const newReason = new this.clockOutReasonModel({
        ...reasonData,
        created_by: loggedUser._id,
      });

      const savedReason = await newReason.save();

      return savedReason.toObject({ versionKey: false });
    } catch (err) {
      new Logger().debug(
        `clock-out-reason.database.service.ts -> createNewClockOutReason -> ${err}`,
        'DEBUG',
      );
      return null;
    }
  }

  /**
   * This function updates a clock-out reason document in a MongoDB collection based on the provided ID
   * and update data, with validation and logging information.
   */
  async findClockOutReasonByIdAndUpdate(
    id: Types.ObjectId,
    updateData: Partial<IClockOutReason>,
    loggedUser: ILoggedUser,
  ): Promise<IClockOutReason | null> {
    try {
      const updatedReason = await this.clockOutReasonModel.findByIdAndUpdate(
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
        `clock-out-reason.database.service.ts -> findClockOutReasonByIdAndUpdate -> ${err}`,
        'DEBUG',
      );
      return null;
    }
  }
}
