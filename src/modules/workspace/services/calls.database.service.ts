import { CommonDatabaseService } from '@common/services/common.database.service';
import { DB_COLLECTION_NAMES } from '@constant/common/db-collection-names';
import { ICall } from '@interface/workspace/calls';
import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ICallModel } from '../schemas/calls.schema';
import { LogsDatabaseService } from '@module/activity-logs/services/logs.database.service';
import { FilterQuery, Model, PipelineStage } from 'mongoose';
import {
  CallsRequestQueryDto,
  InitiateCallRequestBody,
  UpdateCallDto,
} from '@dto/workspace/calls-request.dto';
import { ILoggedUser } from '@interface/authorization/user';
import { RESPONSE_MESSAGES } from '@constant/common/responses';
import { paginator, responseOrderMaker } from '@common/helpers/custom.helper';
import { SYSTEM_STATUS } from '@constant/workspace/calls';

@Injectable()
export class CallsDatabaseService extends CommonDatabaseService<ICall> {
  constructor(
    @InjectModel(DB_COLLECTION_NAMES.CALLS)
    private readonly callModel: Model<ICallModel>,
    logsDatabaseService: LogsDatabaseService,
  ) {
    super(logsDatabaseService, callModel, DB_COLLECTION_NAMES.CALLS);
  }

  async filterCalls(
    filter: FilterQuery<CallsRequestQueryDto>,
    start: number = 0,
    size: number = 10
  ): Promise<{ data: any[]; count: number }> {
    try {
      const aggregationPipeline: PipelineStage[] = [
        { $match: filter },
        {
          $facet: {
            data: [
              { $sort: { created_on: -1 } },
              ...paginator(start, size),
              {
                $project: {
                  _id: 1,
                  call_id: 1,
                  phone_number: 1,
                  system_status: 1,
                  initiated_time: 1,
                  answered_time: 1,
                  object_type_id: 1,
                  feedback_status: 1,
                  hangup_disposition: 1,
                  end_time: 1,
                  audio_data: 1,
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
      const result = await this.callModel.aggregate(aggregationPipeline);

      return {
        data: responseOrderMaker(start, size, result[0].data, result[0].count),
        count: result[0].count ?? 0,
      };
    } catch (err) {
      new Logger().debug(
        `calls.database.service.ts -> filterCalls -> ${err}`,
        'DEBUG',
      );
      throw new InternalServerErrorException([RESPONSE_MESSAGES.DB_FAILURE]);
    }
  }

  async initiateNewCall(
    initialCallRequestBody: InitiateCallRequestBody,
    loggedUser: ILoggedUser,
  ) {
    try {
      const newCall = new this.callModel({
        ...initialCallRequestBody,
        initiated_time: Date.now(),
        system_status: SYSTEM_STATUS.INITIAL,
        created_by: loggedUser._id,
      });

      const initiatedCall = await newCall.save();

      return initiatedCall.toObject({ versionKey: false });
    } catch (err) {
      new Logger().debug(
        `calls.database.service.ts -> initiateNewCall -> ${err}`,
        'DEBUG',
      );
      throw new Error(err);
    }
  }

  async findCallByIdAndUpdate(
    id: string,
    updateCallData: UpdateCallDto,
    loggedUser: ILoggedUser,
  ): Promise<ICall | null> {
    try {
      const updatedCallData = await this.callModel.findByIdAndUpdate(
        id,
        {
          $set: {
            ...updateCallData,
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

      return updatedCallData;
    } catch (err) {
      new Logger().debug(
        `calls.database.service.ts -> findCallByIdAndUpdate -> ${err}`,
        'DEBUG',
      );
      return null;
    }
  }

  async filterCallRecords(
    pipelineStages: PipelineStage[],
    start: number = 0,
    size: number = 10,
  ) {
    try {
      pipelineStages.push({
        $facet: {
          data: [
            { $sort: { created_on: -1 } },
            ...paginator(start, size),

            {
              $addFields: {
                billable_call_duration: {
                  $cond: {
                    if: {
                      $or: [
                        { $not: ['$end_time'] },
                        { $not: ['$answered_time'] },
                      ],
                    },
                    then: 0,
                    else: {
                      $subtract: [
                        { $toDate: '$end_time' },
                        { $toDate: '$answered_time' },
                      ],
                    },
                  },
                },
                call_duration: {
                  $cond: {
                    if: {
                      $or: [
                        { $not: ['$end_time'] },
                        { $not: ['$initiated_time'] },
                      ],
                    },
                    then: 0,
                    else: {
                      $subtract: [
                        { $toDate: '$end_time' },
                        { $toDate: '$initiated_time' },
                      ],
                    },
                  },
                },
              },
            },
            {
              $project: {
                _id: 1,
                call_id: 1,
                phone_number: 1,
                system_status: 1,
                initiated_time: 1,
                answered_time: 1,
                object_type_id: 1,
                feedback_status: 1,
                hangup_disposition: 1,
                end_time: 1,
                audio_data: 1,
                billable_call_duration: 1,
                call_duration: 1,
              },
            },
          ],
          count: [{ $count: 'total' }],
        },
      });

      pipelineStages.push({
        $project: {
          data: 1,
          count: { $arrayElemAt: ['$count.total', 0] },
        },
      });

      const result = await this.callModel.aggregate(pipelineStages);

      return {
        data: responseOrderMaker(start, size, result[0].data, result[0].count),
        count: result[0].count ?? 0,
      };
    } catch (err) {
      new Logger().debug(
        `calls.database.service.ts -> filterCallRecords -> ${err}`,
        'DEBUG',
      );
      throw new InternalServerErrorException([RESPONSE_MESSAGES.DB_FAILURE]);
    }
  }
}
