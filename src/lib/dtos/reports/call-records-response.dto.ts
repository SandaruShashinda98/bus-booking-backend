import { getFormattedTime } from '@common/helpers/date-time.helper';
import { CALL_STATUS_MAP } from '@constant/workspace/calls';
import { ApiProperty } from '@nestjs/swagger';

export class CallRecordsItemDto {
  constructor(data: any) {
    this._id = data._id;
    this.call_id = data.call_id;
    this.phone_number = data.phone_number;
    this.initiated_time = data.initiated_time;
    this.answered_time = data.answered_time || null;
    this.end_time = data.end_time || null;
    this.audio_data = data.audio_data || null;
    this.object_type_id = data.object_type_id;
    this.feedback_status = data.feedback_status || null;
    this.hangup_disposition = data.hangup_disposition || null;
    this.call_duration = getFormattedTime(data.call_duration);
    this.billable_call_duration = getFormattedTime(data.billable_call_duration);
    this.status = CALL_STATUS_MAP[data.system_status];
  }
  @ApiProperty()
  _id: string;

  @ApiProperty()
  call_id: string;

  @ApiProperty()
  phone_number: string;

  @ApiProperty()
  initiated_time: Date;

  @ApiProperty({ required: false, nullable: true })
  answered_time?: Date;

  @ApiProperty({ required: false, nullable: true })
  end_time?: Date;

  @ApiProperty({ required: false })
  audio_data?: {
    url?: string;
    name?: string;
  };

  @ApiProperty()
  object_type_id: number;

  @ApiProperty({ required: false, nullable: true })
  feedback_status?: number;

  @ApiProperty({ required: false, nullable: true })
  hangup_disposition?: number;

  @ApiProperty()
  call_duration: string;

  @ApiProperty()
  billable_call_duration: string;

  @ApiProperty()
  status: string;
}

export class CallRecordsResponseDto {

    constructor(data:CallRecordsItemDto[],count:number){
        this.data = data;
        this.count = count
    }

  @ApiProperty({ type: [CallRecordsItemDto] })
  data: CallRecordsItemDto[];

  @ApiProperty()
  count: number;
}
