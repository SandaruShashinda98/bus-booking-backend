import { CommonDatabaseService } from '@common/services/common.database.service';
import { DB_COLLECTION_NAMES } from '@constant/common/db-collection-names';
import { ITrunks } from '@interface/settings/trunks';
import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, PipelineStage } from 'mongoose';
import { ITrunksModel } from '../schemas/trunks.schema';
import { LogsDatabaseService } from '@module/activity-logs/services/logs.database.service';
import {
  CreateTrunkRequestBodyDto,
  GetTrunksFilterQuery,
  UpdateTrunkRequestBodyDto,
} from '@dto/settings/trunks-request.dto';
import { paginator, responseOrderMaker } from '@common/helpers/custom.helper';
import { ILoggedUser } from '@interface/authorization/user';
import { RESPONSE_MESSAGES } from '@constant/common/responses';

@Injectable()
export class TrunksDatabaseService extends CommonDatabaseService<ITrunks> {
  constructor(
    @InjectModel(DB_COLLECTION_NAMES.TRUNKS)
    private readonly trunksModel: Model<ITrunksModel>,
    logsDatabaseService: LogsDatabaseService,
  ) {
    super(logsDatabaseService, trunksModel, DB_COLLECTION_NAMES.TRUNKS);
  }

  async filterTrunks(
    filters: FilterQuery<GetTrunksFilterQuery>,
    start: number = 0,
    size: number = 10,
  ): Promise<{ data: any[]; count: number }> {
    try {
      const aggregationPipeline: PipelineStage[] = [
        { $match: filters },
        {
          $facet: {
            data: [
              { $sort: { created_on: -1 } },
              ...paginator(start, size),
              {
                $project: {
                  _id: 1,
                  name: 1,
                  uri: 1,
                  state: 1,
                  assigned_rules: 1,
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

      const result = await this.trunksModel.aggregate(aggregationPipeline);

      return {
        data: responseOrderMaker(start, size, result[0].data, result[0].count),
        count: result[0].count ?? 0,
      };
    } catch (err) {
      new Logger().debug(
        `trunks.database.service.ts -> filterTrunks -> ${err}`,
        'DEBUG',
      );
      throw new InternalServerErrorException([RESPONSE_MESSAGES.DB_FAILURE]);
    }
  }

  async createNewTrunk(
    createTrunkRequestBodyDto: CreateTrunkRequestBodyDto,
    loggedUser: ILoggedUser,
  ) {
    try {
      const newTrunk = new this.trunksModel({
        ...createTrunkRequestBodyDto,
        created_by: loggedUser?._id,
      });

      const savedTrunk = await newTrunk.save();

      return savedTrunk.toObject({ versionKey: false });
    } catch (err) {
      new Logger().debug(
        `trunks.database.service.ts -> createNewTrunk -> ${err}`,
        'DEBUG',
      );
      throw new Error(err);
    }
  }

  async updateTrunkData(
    id: string,
    updateTrunkRequestBodyDto: UpdateTrunkRequestBodyDto,
    loggedUser: ILoggedUser,
  ): Promise<ITrunks | null> {
    try {
      const updatedTrunk = await this.trunksModel.findByIdAndUpdate(
        id,
        {
          $set: {
            ...updateTrunkRequestBodyDto,
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

      return updatedTrunk;
    } catch (err) {
      new Logger().debug(
        `trunks.database.service.ts -> updateTrunkData -> ${err}`,
        'DEBUG',
      );
      return null;
    }
  }
}
