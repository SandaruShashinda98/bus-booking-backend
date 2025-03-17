import { regexPhoneNumberFilter } from '@common/helpers/custom.helper';
import { S3Service } from '@common/services/s3.service';
import { CALL_DURATION_VALUES, DURATION } from '@constant/reports/call-records';
import { SYSTEM_ANSWERED_STATUSES } from '@constant/workspace/calls';
import { CallRecordsRequestBodyFilter } from '@dto/reports/call-records-request.dto';
import {
  CallRecordsItemDto,
  CallRecordsResponseDto,
} from '@dto/reports/call-records-response.dto';
import { ICall } from '@interface/workspace/calls';
import { Injectable } from '@nestjs/common';
import { FilterQuery, PipelineStage, Types } from 'mongoose';

@Injectable()
export class CallRecordsService {
  constructor(private readonly s3Service: S3Service) {}

  getCallRecordsSummaryFilter(
    callRecordsRequestBodyFilter: CallRecordsRequestBodyFilter,
  ): PipelineStage[] {
    const filter: FilterQuery<ICall> = {
      system_status: { $in: SYSTEM_ANSWERED_STATUSES },
      is_delete: false,
    };

    if (
      callRecordsRequestBodyFilter.start_time &&
      callRecordsRequestBodyFilter.end_time
    ) {
      filter.end_time = {
        $gte: callRecordsRequestBodyFilter.start_time,
        $lte: callRecordsRequestBodyFilter.end_time,
      };
    }

    if (callRecordsRequestBodyFilter.phone_number) {
      filter.phone_number = regexPhoneNumberFilter(
        callRecordsRequestBodyFilter.phone_number,
      );
    }

    if (
      Array.isArray(callRecordsRequestBodyFilter.agent) &&
      callRecordsRequestBodyFilter.agent.length > 0
    ) {
      filter.created_by = {
        $in: callRecordsRequestBodyFilter.agent.map(
          (i) => new Types.ObjectId(i),
        ),
      };
    }

    if (callRecordsRequestBodyFilter.object_type_id) {
      filter.object_type_id = callRecordsRequestBodyFilter.object_type_id;
    }

    const pipelineStages: PipelineStage[] = [{ $match: filter }];

    if (callRecordsRequestBodyFilter.duration) {
      pipelineStages.push(
        ...this.getCorrectDuration(
          callRecordsRequestBodyFilter.duration as DURATION,
        ),
      );
    }
    return pipelineStages;
  }

  getCorrectDuration(duration: DURATION): PipelineStage[] {
    const durationValue = CALL_DURATION_VALUES[duration];
    const operator = duration === DURATION.GREATER_THAN_2MINS ? '$gt' : '$lt';

    return [
      {
        $addFields: {
          callDuration: {
            $cond: {
              if: {
                $or: [{ $not: ['$end_time'] }, { $not: ['$answered_time'] }],
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
        },
      },
      {
        $match: {
          callDuration: {
            [operator]: durationValue,
          },
        },
      },
    ];
  }

  async getResponseDto(result: {
    data: ICall[];
    count: number;
  }): Promise<CallRecordsResponseDto> {
    if (!Array.isArray(result.data))
      return new CallRecordsResponseDto(result.data, result.count);

    //TODO need to handle different error scenarios
    const transformedData = await Promise.all(
      result.data.map(
        async (i) => new CallRecordsItemDto(await this.addAudioData(i)),
      ),
    );

    return new CallRecordsResponseDto(transformedData, result.count);
  }

  async addAudioData(data: any) {
    const result = await this.s3Service.getFileInFolder(
      'Audio Files',
      data.audio_data.name,
    );

    data.audio_data = result;

    return data;
  }
}
