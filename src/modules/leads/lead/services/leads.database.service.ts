import { CommonDatabaseService } from '@common/services/common.database.service';
import { Injectable, Logger } from '@nestjs/common';
import { LogsDatabaseService } from '@module/activity-logs/services/logs.database.service';
import { InjectModel } from '@nestjs/mongoose';
import { DB_COLLECTION_NAMES } from '@constant/common/db-collection-names';
import { FilterQuery, Model, PipelineStage, Types } from 'mongoose';
import { ILead } from '@interface/leads/leads';
import { ILoggedUser } from '@interface/authorization/user';
import { LEAD_DENY_STATUS } from '@constant/leads/leads';
import { paginator, responseOrderMaker } from '@common/helpers/custom.helper';
import { ILeadModel } from '../schemas/lead.schema';
import { leadDetailsMap } from '@common/helpers/leadDetailsMap';

@Injectable()
export class LeadDatabaseService extends CommonDatabaseService<ILead> {
  constructor(
    @InjectModel(DB_COLLECTION_NAMES.LEADS)
    private readonly leadModel: Model<ILeadModel>,
    logsDatabaseService: LogsDatabaseService,
  ) {
    super(logsDatabaseService, leadModel, DB_COLLECTION_NAMES.LEADS);
  }

  //Overridden
  filterDocumentsWithPagination(): Promise<{
    data: ILead[];
    count: number;
  }> {
    throw new Error(
      'This method is not supported in LeadDatabaseService. Use filterLeadsWithPagination instead.',
    );
  }

  async filterLeadsWithPagination(
    filters: FilterQuery<ILead>,
    skip: number = 0,
    limit: number = 10,
    deny_status: LEAD_DENY_STATUS = LEAD_DENY_STATUS.ALLOWED,
  ): Promise<{ data: ILead[]; count: number }> {
    const sortStage = {
      $sort:
        deny_status === LEAD_DENY_STATUS.ALLOWED
          ? { created_on: -1 as const }
          : { last_modified_on: -1 as const },
    };

    const aggregationPipeline: PipelineStage[] = [
      { $match: filters },
      {
        $facet: {
          data: [sortStage, ...paginator(skip, limit)],
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

    const result = await this.leadModel.aggregate(aggregationPipeline);

    // Return the data and count in the common format
    return {
      data: responseOrderMaker(skip, limit, result[0].data, result[0].count),
      count: result[0].count || 0,
    };
  }

  async filterLeadsByGroup(
    filters: FilterQuery<any>,
    skip: number = 0,
    limit: number = 10,
  ) {
    const aggregationPipeline: PipelineStage[] = [
      { $match: { is_delete: false } },
      { $match: filters },
      {
        $facet: {
          data: [...paginator(skip, limit)],
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

    const result = await this.leadModel.aggregate(aggregationPipeline);

    // Return the data and count in the common format
    return {
      data: responseOrderMaker(skip, limit, result[0].data, result[0].count),
      count: result[0].count || 0,
    };
  }

  /**
   * The function creates a new lead with the provided data and the ID of the logged-in user.
   */
  async createNewLead(
    leadData: Partial<ILead>,
    loggedUser: ILoggedUser,
  ): Promise<ILead | null> {
    try {
      const newLead = new this.leadModel({
        ...leadData,
        created_by: loggedUser._id,
      });

      const savedLead = await newLead.save();

      return savedLead.toObject({ versionKey: false });
    } catch (err) {
      new Logger().debug(
        `leads.database.service.ts -> createNewLead -> ${err}`,
        'DEBUG',
      );
      return null;
    }
  }

  /**
   * This function updates a lead document in a MongoDB collection based on the provided ID
   * and update data, with validation and logging information.
   */
  async findLeadByIdAndUpdate(
    id: Types.ObjectId,
    updateData: Partial<ILead>,
    loggedUser: ILoggedUser,
  ): Promise<ILead | null> {
    try {
      const updatedLead = await this.leadModel.findByIdAndUpdate(
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
      return updatedLead;
    } catch (err) {
      new Logger().debug(
        `leads.database.service.ts -> findLeadByIdAndUpdate -> ${err}`,
        'DEBUG',
      );
      return null;
    }
  }

  async getDuplicatePhoneNumbers(phoneNumbers: string[]): Promise<string[]> {
    const duplicatePhoneNumbersPipeline: PipelineStage[] = [
      {
        $match: { phone: { $in: phoneNumbers } },
      },
      {
        $group: {
          _id: null,
          existingPhoneNumbers: { $addToSet: '$phone' },
        },
      },
    ];

    try {
      const existingNumbers = await this.leadModel.aggregate(
        duplicatePhoneNumbersPipeline,
      );

      return existingNumbers[0]?.existingPhoneNumbers;
    } catch (error) {
      new Logger().debug(
        `leads.database.service.ts -> getDuplicatePhoneNumbers -> ${error}`,
      );

      throw new Error(error);
    }
  }

  async updateDenyListLeads(
    phoneNumbers: string[],
    preApproved: boolean,
    loggedUser: ILoggedUser,
  ): Promise<void> {
    const updateLeadsPipeline: PipelineStage[] = [
      {
        $match: {
          $and: [
            {
              phone: { $in: phoneNumbers },
            },
            {
              deny_status: { $eq: LEAD_DENY_STATUS.ALLOWED },
            },
          ],
        },
      },
      {
        $set: {
          deny_status: preApproved
            ? LEAD_DENY_STATUS.DENIED
            : LEAD_DENY_STATUS.PENDING_DENY,
          changed_by: loggedUser._id,
          last_modified_on: new Date(),
        },
      },
    ];

    try {
      await this.leadModel.aggregate(updateLeadsPipeline);
    } catch (err) {
      new Logger().debug(
        `leads.database.service.ts -> updateDenyListLeads -> ${err}`,
      );

      throw new Error(err);
    }
  }

  async bulkInsertLeadsWithPhone(
    duplicatePhoneNumbers: { phone: string; deny_status: string }[],
  ) {
    try {
      const result = await this.leadModel.insertMany(duplicatePhoneNumbers);

      return result;
    } catch (err) {
      new Logger().debug(
        `leads.database.service.ts -> bulkInsertLeadsWithPhone -> ${err}`,
      );

      throw new Error(err);
    }
  }

  async updateMultipleDocumentsFromArray(
    status: LEAD_DENY_STATUS,
    filter: unknown,
    loggedUser: ILoggedUser,
  ) {
    try {
      return await this.leadModel.updateMany(filter, {
        $set: {
          deny_status: status,
          changed_by: loggedUser._id,
          last_modified_on: new Date(),
        },
      });
    } catch (err) {
      new Logger().debug(
        `leads.database.service.ts -> updateMultipleDocumentsFromArray -> ${err}`,
      );

      throw new Error(err);
    }
  }

  async assignToCampaign(
    loggedUser: ILoggedUser,
    bodyContent: {
      campaign_id: Types.ObjectId;
      lead_file_id: Types.ObjectId;
    },
  ) {
    try {
      const result = this.leadModel.updateMany(
        { upload_id: bodyContent.lead_file_id },
        {
          $set: {
            campaign_id: bodyContent.campaign_id,
            changed_by: loggedUser._id,
            last_modified_on: new Date(),
          },
        },
      );

      return result;
    } catch (err) {
      new Logger().debug(
        `leads.database.service.ts -> assignToCampaign -> ${err}`,
      );
      throw err;
    }
  }

  async findCampaignDetails(id: Types.ObjectId) {
    try {
      return this.leadModel.findOne({ _id: id }).populate('campaign_id');
    } catch (error) {
      new Logger().debug(
        `leads.database.service.ts -> findCampaignDetails -> ${error}`,
      );
      throw error;
    }
  }

  async findOrCreateLeadByPhone(phone: string, loggedUser: ILoggedUser) {
    if (!phone) return;

    let foundLead: ILead = null;

    foundLead = await this.findDocument({
      phone: phone,
    });

    if (!foundLead)
      foundLead = await this.createNewLead({ phone: phone }, loggedUser);

    leadDetailsMap(foundLead);

    return { data: foundLead };
  }
}
