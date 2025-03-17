import { regexPhoneNumberFilter } from '@common/helpers/custom.helper';
import { CallsRequestQueryDto } from '@dto/workspace/calls-request.dto';
import { Injectable } from '@nestjs/common';
import { FilterQuery } from 'mongoose';

@Injectable()
export class CallsService {
  constructor() {}

  getCallsFilters(
    queryParams: CallsRequestQueryDto,
  ): FilterQuery<CallsRequestQueryDto> {
    const filter: FilterQuery<CallsRequestQueryDto> = {
      ...(queryParams.phone_number
        ? { phone_number: regexPhoneNumberFilter(queryParams.phone_number) }
        : {}),
      ...(queryParams.system_status
        ? { system_status: queryParams.system_status }
        : {}),
      ...(queryParams.feedback_status
        ? { feedback_status: queryParams.feedback_status }
        : {}),
      ...(queryParams.hangup_disposition
        ? { hangup_disposition: queryParams.hangup_disposition }
        : {}),
      ...(queryParams.initiated_time
        ? { initiated_time: queryParams.initiated_time }
        : {}),
      ...(queryParams.answered_time
        ? { answered_time: queryParams.answered_time }
        : {}),
      ...(queryParams.end_time ? { end_time: queryParams.end_time } : {}),
      is_delete: false,
    };

    return filter;
  }
}
