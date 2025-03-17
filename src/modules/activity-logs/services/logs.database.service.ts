import { DB_COLLECTION_NAMES } from '@constant/common/db-collection-names';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, PipelineStage } from 'mongoose';
import { ILogModel } from '../schemas/log.schema';
import { ILog } from '@interface/activity-log/activity-log';
import { paginator } from '@common/helpers/custom.helper';

@Injectable()
export class LogsDatabaseService {
  constructor(
    @InjectModel(DB_COLLECTION_NAMES.LOGS)
    private logs: Model<ILogModel>,
  ) {}

  createLog(log: ILog): Promise<ILog> {
    return this.logs.create(log);
  }

  async getEntriesCount(): Promise<number> {
    const aggregationResult = await this.logs
      .aggregate([
        {
          $group: {
            _id: null,
            count: { $sum: 1 },
          },
        },
      ])
      .exec();

    if (aggregationResult.length > 0) {
      return aggregationResult[0].count;
    } else {
      return 0;
    }
  }

  async filterLogs(
    generalFilters: FilterQuery<ILog>,
    limit?: number,
    skip?: number,
  ): Promise<any> {
    const firstPagination: PipelineStage[] = [
      {
        $facet: {
          results: [...paginator(skip, limit)],
          count: [{ $count: 'count' }],
        },
      },
    ];

    const aggregationParams: PipelineStage[] = [
      {
        $match: generalFilters,
      },
      {
        $sort: {
          date: -1,
        },
      },
      ...firstPagination,
    ];

    const results = await this.logs
      .aggregate<any>(aggregationParams)
      .allowDiskUse(true)
      .exec();
    return results[0];
  }
}
