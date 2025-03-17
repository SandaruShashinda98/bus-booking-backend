import { CommonDatabaseService } from '@common/services/common.database.service';
import { Injectable, Logger } from '@nestjs/common';
import { LogsDatabaseService } from '@module/activity-logs/services/logs.database.service';
import { InjectModel } from '@nestjs/mongoose';
import { DB_COLLECTION_NAMES } from '@constant/common/db-collection-names';
import { FilterQuery, Model, PipelineStage, Types } from 'mongoose';
import { IUpload } from '@interface/upload/upload';
import { IUploadModel } from '../schemas/upload-entity.schema';
import { ILoggedUser } from '@interface/authorization/user';
import { paginator, responseOrderMaker } from '@common/helpers/custom.helper';

@Injectable()
export class UploadDatabaseService extends CommonDatabaseService<IUpload> {
  constructor(
    @InjectModel(DB_COLLECTION_NAMES.UPLOAD)
    private readonly uploadModel: Model<IUploadModel>,
    logsDatabaseService: LogsDatabaseService,
  ) {
    super(logsDatabaseService, uploadModel, DB_COLLECTION_NAMES.UPLOAD);
  }

  async filterUploadsWithPagination(
    filters: FilterQuery<any>,
    campaigns: string[],
    skip: number = 0,
    limit: number = 10,
  ): Promise<{ data: IUpload[]; count: number }> {
    const pipelineStage: PipelineStage[] = [{ $match: filters }];

    if (campaigns && Array.isArray(campaigns) && campaigns?.length > 0) {
      pipelineStage.push({
        $lookup: {
          from: DB_COLLECTION_NAMES.LEADS,
          let: { uploadId: '$_id' },
          pipeline: [
            { $match: { $expr: { $eq: ['$upload_id', '$$uploadId'] } } },
            {
              $match: {
                campaign_id: {
                  $in: campaigns.map((id) => new Types.ObjectId(id)),
                },
              },
            },
            { $limit: 1 },
            { $project: { _id: 1 } },
          ],
          as: 'leads',
        },
      });

      pipelineStage.push({
        $match: { leads: { $ne: [] } },
      });
    }

    pipelineStage.push(
      {
        $facet: {
          data: [{ $sort: { created_on: -1 } }, ...paginator(skip, limit)],
          count: [{ $count: 'total' }],
        },
      },
      {
        $project: {
          data: 1,
          count: { $arrayElemAt: ['$count.total', 0] },
        },
      },
    );

    const result = await this.uploadModel.aggregate(pipelineStage);

    return {
      data: responseOrderMaker(skip, limit, result[0].data, result[0].count),
      count: result[0].count || 0,
    };
  }

  async handleLeadFileUpdate(
    id: Types.ObjectId,
    updateData: Partial<any>,
    loggedUser: ILoggedUser,
  ): Promise<any | null> {
    try {
      const updatedData = await this.uploadModel.findByIdAndUpdate(
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
      return updatedData;
    } catch (err) {
      new Logger().debug(
        `upload.database.service.ts -> handleLeadFileUpdate -> ${err}`,
        'DEBUG',
      );
      return null;
    }
  }

  // Method to create a new Job record in the database
  async createUpload(data: IUpload): Promise<IUpload> {
    try {
      const createUpload = new this.uploadModel(data);
      const savedJob = await createUpload.save();
      return savedJob;
    } catch (error) {
      new Logger().error(
        `upload.database.service.ts -> updateByUploadId -> ${error}`,
        'DEBUG',
      );
      throw error;
    }
  }

  // Method to update a Job by its ID
  async updateByUploadId(
    id: string,
    updateData: Partial<IUpload>,
  ): Promise<IUpload | null> {
    try {
      const updatedJob = await this.uploadModel.findByIdAndUpdate(
        id,
        updateData,
        {
          new: true,
        },
      );
      return updatedJob;
    } catch (error) {
      new Logger().error(
        `upload.database.service.ts -> updateByUploadId -> ${error}`,
        'DEBUG',
      );
      throw error;
    }
  }

  // Method to find a Job by its ID
  async findUploadById(id: string): Promise<IUpload | null> {
    try {
      const job = await this.uploadModel.findById(id).exec();
      return job;
    } catch (error) {
      new Logger().error(
        `upload.database.service.ts -> findUploadById -> ${error.message}`,
        'DEBUG',
      );
      throw error;
    }
  }
}
