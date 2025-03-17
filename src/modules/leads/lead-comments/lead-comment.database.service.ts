import { CommonDatabaseService } from '@common/services/common.database.service';
import { DB_COLLECTION_NAMES } from '@constant/common/db-collection-names';
import { ILeadComment } from '@interface/leads/leads';
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, PipelineStage, Types } from 'mongoose';
import { LogsDatabaseService } from '@module/activity-logs/services/logs.database.service';
import {
  createMongoSetObjectForEntitiesWithObjects,
  paginator,
} from '@common/helpers/custom.helper';
import { ILoggedUser } from '@interface/authorization/user';
import { ILeadCommentModel } from './lead-comments.schema';

@Injectable()
export class LeadCommentsDatabaseService extends CommonDatabaseService<ILeadComment> {
  constructor(
    @InjectModel(DB_COLLECTION_NAMES.LEAD_COMMENTS)
    readonly leadCommentModel: Model<ILeadCommentModel>,
    logsDatabaseService: LogsDatabaseService,
  ) {
    super(
      logsDatabaseService,
      leadCommentModel,
      DB_COLLECTION_NAMES.LEAD_COMMENTS,
    );
  }

  /**
   * This function filters lead comments based on the given filters with optional pagination parameters
   * for search with commented person name
   */
  async filterLeadCommentsWithName(
    filters: FilterQuery<any>,
    skip: number = 0,
    limit: number = 10,
    isForCsv = false,
  ): Promise<any[]> {
    const aggregationPipeline: PipelineStage[] = [
      { $match: filters },
      {
        $sort: { created_on: -1 },
      },
      ...paginator(skip, limit),
      {
        $lookup: {
          from: DB_COLLECTION_NAMES.USERS,
          localField: 'created_by',
          foreignField: '_id',
          as: 'user',
        },
      },
      {
        $addFields: {
          creator_name: {
            $concat: [
              { $arrayElemAt: ['$user.first_name', 0] },
              ' ',
              { $arrayElemAt: ['$user.last_name', 0] },
            ],
          },
        },
      },
      {
        $project: isForCsv
          ? {
              user: 0,
              __v: 0,
              is_active: 0,
              _id: 0,
              is_delete: 0,
              last_modified_on: 0,
            }
          : {
              user: 0,
              __v: 0,
            },
      },
    ];

    const result = await this.leadCommentModel.aggregate(aggregationPipeline);
    return result;
  }

  async findLastCommentByUserName(leadId: string) {
    const result = await this.leadCommentModel.aggregate([
      {
        $match: {
          lead_id: new Types.ObjectId(leadId),
        },
      },
      {
        $lookup: {
          from: DB_COLLECTION_NAMES.USERS,
          let: { createdById: { $toObjectId: '$created_by' } },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ['$_id', '$$createdById'] },
              },
            },
          ],
          as: 'user',
        },
      },
      // Filter out documents where no user was matched
      {
        $match: {
          user: { $ne: [] },
        },
      },
      {
        $project: {
          _id: 0,

          first_name: { $first: '$user.first_name' },
          last_name: { $first: '$user.last_name' },
        },
      },
    ]);

    return result[0] || null;
  }

  /*
   * This function creates a new lead comment with the given data.
   */
  async createNewLeadComment(
    leadCommentData: Partial<ILeadComment>,
    loggedUser?: ILoggedUser,
  ): Promise<ILeadComment | null> {
    try {
      const newLeadFilter = new this.leadCommentModel({
        ...leadCommentData,
        created_by: loggedUser?._id,
        is_active: leadCommentData.is_active ?? true,
      });

      const savedLeadFilter = await newLeadFilter.save();

      return savedLeadFilter.toObject({ versionKey: false });
    } catch (err) {
      new Logger().debug(
        `lead-comment-database-service.ts -> createNewLeadComment -> ${err}`,
        'DEBUG',
      );

      return null;
    }
  }

  /**
   * This function finds a single lead comment by its id and update with given data
   */
  async findLeadCommentByIdAndUpdate(
    id: string,
    updateData: Partial<any>,
    loggedUser: ILoggedUser,
  ): Promise<ILeadComment | null> {
    try {
      const updatedLeadComment = await this.leadCommentModel.findByIdAndUpdate(
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

      return updatedLeadComment;
    } catch (err) {
      new Logger().debug(
        `lead-comment.database.service.ts -> findLeadCommentByIdAndUpdate -> ${err}`,
        'DEBUG',
      );
      return null;
    }
  }
}
