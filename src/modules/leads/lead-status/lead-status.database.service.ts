import { CommonDatabaseService } from '@common/services/common.database.service';
import { DB_COLLECTION_NAMES } from '@constant/common/db-collection-names';
import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { FilterQuery, Model, PipelineStage, Types } from 'mongoose';
import { ILeadStatusModel } from './lead-statuses.schema';
import { LogsDatabaseService } from '@module/activity-logs/services/logs.database.service';
import { InjectModel } from '@nestjs/mongoose';
import { ILeadStatus } from '@interface/leads/lead-status';
import { LeadStatusRequestQueryDto } from '@dto/leads/lead-status.request.query.dto';
import { paginator, responseOrderMaker } from '@common/helpers/custom.helper';
import { ILoggedUser } from '@interface/authorization/user';
import { LeadStatusDto } from '@dto/leads/lead-status.request.dto';
import { RESPONSE_MESSAGES } from '@constant/common/responses';

@Injectable()
export class LeadStatusDatabaseService extends CommonDatabaseService<ILeadStatus> {
  constructor(
    @InjectModel(DB_COLLECTION_NAMES.LEAD_STATUS)
    private readonly leadStatusModel: Model<ILeadStatusModel>,
    logsDatabaseService: LogsDatabaseService,
  ) {
    super(
      logsDatabaseService,
      leadStatusModel,
      DB_COLLECTION_NAMES.LEAD_STATUS,
    );
  }

  async filterLeadCampaigns(
    filter: FilterQuery<LeadStatusRequestQueryDto>,
    skip: number = 0,
    limit: number = 10,
  ) {
    try {
      const aggregationPipeline: PipelineStage[] = [
        { $match: filter },
        {
          $facet: {
            data: [
              { $sort: { created_on: -1 } },
              ...paginator(skip, limit),
              {
                $project: {
                  _id: 1,
                  name: 1,
                  description: 1,
                  background_color: 1,
                  text_color: 1,
                  feedback_requirements: 1,
                  status_workflow: 1,
                  api_mapping: 1,
                  is_active: 1,
                  is_delete: 1,
                  created_on: 1,
                  created_by: 1,
                  changed_by: 1,
                  last_modified_on: 1,
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

      const result = await this.leadStatusModel.aggregate(aggregationPipeline);

      return {
        data: responseOrderMaker(skip, limit, result[0].data, result[0].count),
        count: result[0].count ?? 0,
      };
    } catch (err) {
      new Logger().debug(
        `lead-status-database-service.ts -> filterLeadCampaigns -> ${err}`,
        'DEBUG',
      );

      throw new InternalServerErrorException([RESPONSE_MESSAGES.DB_FAILURE]);
    }
  }

  async createNewLeadStatus(
    leadStatusData: Partial<ILeadStatus>,
    loggedUser: ILoggedUser,
  ): Promise<ILeadStatus | null> {
    try {
      const newLeadStatus = new this.leadStatusModel({
        ...leadStatusData,
        created_by: loggedUser._id,
        is_active: loggedUser.is_active ?? true,
      });

      const savedLeadStatus = await newLeadStatus.save();

      return savedLeadStatus.toObject({ versionKey: false });
    } catch (err) {
      new Logger().debug(
        `lead-status-database-service.ts -> createNewLeadStatus -> ${err}`,
        'DEBUG',
      );

      return null;
    }
  }

  async findStatusByIdAndUpdate(
    id: string,
    updateData: Partial<ILeadStatus>,
    loggedUser: ILoggedUser,
  ): Promise<ILeadStatus | null> {
    try {
      const updatedLeadStatus = await this.leadStatusModel.findByIdAndUpdate(
        id,
        {
          $set: updateData,
          changed_by: loggedUser._id,
          last_modified_on: new Date(),
        },
      );

      return updatedLeadStatus;
    } catch (err) {
      new Logger().debug(
        `lead-status-database-service.ts -> findStatusByIdAndUpdate -> ${err}`,
        'DEBUG',
      );

      return null;
    }
  }

  //The following function checks whether an lead status exist with the same name
  async findExistingLeadStatus(
    createLeadStatusDto: LeadStatusDto,
    statusID: string,
  ) {
    try {
      if (statusID) {
        return await this.findDocument({
          _id: { $ne: new Types.ObjectId(statusID) },
          name: createLeadStatusDto.name,
          campaign_id: createLeadStatusDto.campaign_id,
          is_delete: false,
        });
      } else {
        return await this.findDocument({
          name: createLeadStatusDto.name,
          campaign_id: createLeadStatusDto.campaign_id,
          is_delete: false,
        });
      }
    } catch (err) {
      new Logger().debug(
        `lead-status-database-service.ts -> findExistingLeadStatus -> ${err}`,
        'DEBUG',
      );

      throw new InternalServerErrorException([RESPONSE_MESSAGES.DB_FAILURE]);
    }
  }
}
