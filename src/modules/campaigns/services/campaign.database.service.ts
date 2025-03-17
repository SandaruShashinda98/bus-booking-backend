import { LeadCampaignsRequestQueryDto } from '@dto/leads/lead-campaigns.query.dto';
import { Injectable, Logger } from '@nestjs/common';
import { FilterQuery, Model, PipelineStage, Types } from 'mongoose';
import { ILeadCampaignModel } from '../schemas/campaign.schema';
import {
  createMongoSetObjectForEntitiesWithObjects,
  paginator,
  responseOrderMaker,
} from '@common/helpers/custom.helper';
import { InjectModel } from '@nestjs/mongoose';
import { DB_COLLECTION_NAMES } from '@constant/common/db-collection-names';
import { LogsDatabaseService } from '@module/activity-logs/services/logs.database.service';
import { CommonDatabaseService } from '@common/services/common.database.service';
import { ILeadCampaign } from '@interface/leads/lead-campaign';
import { ILoggedUser } from '@interface/authorization/user';

@Injectable()
export class CampaignDatabaseService extends CommonDatabaseService<ILeadCampaign> {
  constructor(
    @InjectModel(DB_COLLECTION_NAMES.LEAD_CAMPAIGN)
    private readonly leadCampaignModel: Model<ILeadCampaignModel>,
    logsDatabaseService: LogsDatabaseService,
  ) {
    super(
      logsDatabaseService,
      leadCampaignModel,
      DB_COLLECTION_NAMES.LEAD_CAMPAIGN,
    );
  }

  //filter lead campaigns documents
  async filterLeadCampaigns(
    filter: FilterQuery<LeadCampaignsRequestQueryDto>,
    skip: number = 0,
    limit: number = 10,
  ) {
    const aggregationPipeline: PipelineStage[] = [
      {
        $match: filter,
      },
      {
        $facet: {
          data: [
            { $sort: { created_on: -1 } },
            ...paginator(skip, limit),
            {
              $project: {
                _id: 1,
                general: { name: 1, is_active_campaign: 1 },
                is_active: 1,
                is_delete: 1,
                created_on: 1,
                created_by: 1,
                changed_by: 1,
                last_modified_on: 1,
                status: {
                  $add: [
                    {
                      $cond: [
                        { $ifNull: ['$status', false] },
                        { $size: '$status' },
                        0,
                      ],
                    },
                    {
                      $cond: [
                        {
                          $ifNull: [
                            '$direct_dial_settings.predictive_dialer_settings.default_status_no_answer',
                            false,
                          ],
                        },
                        1,
                        0,
                      ],
                    },
                    {
                      $cond: [
                        {
                          $ifNull: [
                            '$dropped_call_settings.status_for_dropped_calls',
                            false,
                          ],
                        },
                        1,
                        0,
                      ],
                    },
                    {
                      $cond: [
                        {
                          $ifNull: [
                            '$voice_mail_settings.default_status_for_voice_mail',
                            false,
                          ],
                        },
                        1,
                        0,
                      ],
                    },
                    {
                      $cond: [
                        {
                          $ifNull: [
                            '$voice_mail_settings.voice_mail_button_status',
                            false,
                          ],
                        },
                        1,
                        0,
                      ],
                    },
                    {
                      $cond: [
                        {
                          $ifNull: [
                            '$direct_dial_settings.predictive_dialer_settings.default_status_busy_line',
                            false,
                          ],
                        },
                        1,
                        0,
                      ],
                    },
                    {
                      $cond: [
                        {
                          $ifNull: [
                            '$direct_dial_settings.predictive_dialer_settings.default_status_for_connection_error',
                            false,
                          ],
                        },
                        1,
                        0,
                      ],
                    },
                  ],
                },
                total_leads: 1,
                available_leads: 1,
              },
            },
          ],
          count: [{ $count: 'total' }],
        },
      },
      {
        $project: {
          data: 1,
          count: {
            $ifNull: [{ $arrayElemAt: ['$count.total', 0] }, 0],
          },
        },
      },
    ];

    const result = await this.leadCampaignModel.aggregate(aggregationPipeline);

    return {
      data: responseOrderMaker(skip, limit, result[0].data, result[0].count),
      count: result[0].count ?? 0,
    };
  }

  //find the campaign and update the document content
  async findCampaignByIdAndUpdate(
    id: string,
    updateData: Partial<ILeadCampaign>,
    loggedUser: ILoggedUser,
  ): Promise<ILeadCampaign | null> {
    try {
      const updatedLeadCampaign =
        await this.leadCampaignModel.findByIdAndUpdate(
          id,
          {
            $set: {
              ...createMongoSetObjectForEntitiesWithObjects(updateData),
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

      return updatedLeadCampaign;
    } catch (err) {
      new Logger().debug(
        `lead-campaign.database.service.ts -> findCampaignByIdAndUpdate -> ${err}`,
        'DEBUG',
      );
      return null;
    }
  }

  async createNewCampaign(
    leadCampaignData: Partial<ILeadCampaign>,
    loggedUser: ILoggedUser,
  ) {
    try {
      const newCampaign = new this.leadCampaignModel({
        ...leadCampaignData,
        created_by: loggedUser?._id,
      });

      const savedLeadCampaign = await newCampaign.save();

      return savedLeadCampaign.toObject({ versionKey: false });
    } catch (err) {
      new Logger().debug(
        `lead-campaign.database.service.ts -> createNewCampaign -> ${err}`,
        'DEBUG',
      );
      throw new Error(err);
    }
  }

  async findDocumentWithPopulated(id: string) {
    try {
      const aggregationPipeline: PipelineStage[] = [
        {
          $match: {
            _id: new Types.ObjectId(id),
          },
        },
        {
          $lookup: {
            from: 'lead_statuses',
            let: { statusArray: '$status' },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $in: ['$_id', '$$statusArray.id'],
                  },
                },
              },
              {
                $addFields: {
                  value: {
                    $let: {
                      vars: {
                        matchedStatus: {
                          $arrayElemAt: [
                            {
                              $filter: {
                                input: '$$statusArray',
                                as: 'stat',
                                cond: { $eq: ['$$stat.id', '$_id'] },
                              },
                            },
                            0,
                          ],
                        },
                      },
                      in: {
                        $ifNull: ['$$matchedStatus.value', 0],
                      },
                    },
                  },
                },
              },
            ],
            as: 'status',
          },
        },
        {
          $lookup: {
            from: 'lead_statuses',
            localField:
              'direct_dial_settings.feedback_page_settings.feedback_timeout_status',
            foreignField: '_id',
            as: 'direct_dial_settings.feedback_page_settings.feedback_timeout_status',
          },
        },
        {
          $lookup: {
            from: 'lead_statuses',
            localField:
              'general.predictive_dialer_settings.default_status_no_answer',
            foreignField: '_id',
            as: 'direct_dial_settings.predictive_dialer_settings.default_status_no_answer',
          },
        },
        {
          $lookup: {
            from: 'lead_statuses',
            localField: 'dropped_call_settings.status_for_dropped_calls',
            foreignField: '_id',
            as: 'dropped_call_settings.status_for_dropped_calls',
          },
        },
        {
          $lookup: {
            from: 'lead_statuses',
            localField: 'voice_mail_settings.default_status_for_voice_mail',
            foreignField: '_id',
            as: 'voice_mail_settings.default_status_for_voice_mail',
          },
        },
        {
          $lookup: {
            from: 'lead_statuses',
            localField: 'voice_mail_settings.voice_mail_button_status',
            foreignField: '_id',
            as: 'voice_mail_settings.voice_mail_button_status',
          },
        },
        {
          $lookup: {
            from: 'lead_statuses',
            localField:
              'direct_dial_settings.predictive_dialer_settings.default_status_busy_line',
            foreignField: '_id',
            as: 'direct_dial_settings.predictive_dialer_settings.default_status_busy_line',
          },
        },
        {
          $lookup: {
            from: 'lead_statuses',
            localField:
              'direct_dial_settings.predictive_dialer_settings.default_status_for_connection_error',
            foreignField: '_id',
            as: 'direct_dial_settings.predictive_dialer_settings.default_status_for_connection_error',
          },
        },
        {
          $unwind: {
            path: '$direct_dial_settings.feedback_page_settings.feedback_timeout_status',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $unwind: {
            path: '$direct_dial_settings.predictive_dialer_settings.default_status_for_connection_error',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $unwind: {
            path: '$direct_dial_settings.predictive_dialer_settings.default_status_busy_line',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $unwind: {
            path: '$voice_mail_settings.voice_mail_button_status',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $unwind: {
            path: '$voice_mail_settings.default_status_for_voice_mail',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $unwind: {
            path: '$dropped_call_settings.status_for_dropped_calls',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $unwind: {
            path: '$direct_dial_settings.predictive_dialer_settings.default_status_no_answer',
            preserveNullAndEmptyArrays: true,
          },
        },
      ];

      const data = await this.leadCampaignModel.aggregate(aggregationPipeline);

      return data[0];
    } catch (err) {
      new Logger().debug(
        `lead-campaign.database.service.ts -> findDocumentWithPopulated -> ${err}`,
        'DEBUG',
      );
      throw err;
    }
  }

  async findCampaignExistence(
    searchFilter: Partial<ILeadCampaign>,
    id: string = null,
  ) {
    try {
      if (id) {
        return await this.leadCampaignModel.find({
          ...searchFilter,
          _id: { $ne: new Types.ObjectId(id) },
        });
      } else {
        return await this.leadCampaignModel.find(searchFilter);
      }
    } catch (err) {
      new Logger().debug(
        `lead-campaign.database.service.ts -> findCampaignExistence -> ${err}`,
        'DEBUG',
      );
      throw err;
    }
  }
}
