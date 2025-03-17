import { ANSWERING_MACHINE_DETECTION } from '@constant/leads/lead-campaign';
import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDate,
  IsEnum,
  IsMongoId,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Types } from 'mongoose';

export class StatusDto {
  @ApiProperty({
    description: 'The ObjectId of the status',
    type: String,
    example: '507f191e810c19729de860ea',
  })
  @IsMongoId()
  id: Types.ObjectId;

  @ApiProperty({ example: 75, type: Number, required: true })
  @IsNumber()
  value: number;
}

class FeedbackPageSettings {
  @ApiProperty({ example: 75, type: Number, required: true })
  @Transform(({ value }) => (value ? Number(value) : value))
  @IsNumber()
  feedback_page_timeout: number;

  @ApiProperty({
    description: 'The ObjectId of feedback timeout status',
    type: String,
    example: '507f191e810c19729de860ea',
  })
  @IsString()
  feedback_timeout_status: string;

  @ApiProperty({ example: 75, type: Number, required: true })
  @Transform(({ value }) => (value ? Number(value) : value))
  @IsNumber()
  redial_limit: number;
}

class PermanentAssignmentSettings {
  @ApiProperty({ example: 75, type: Number, required: true })
  @Transform(({ value }) => (value ? Number(value) : value))
  @IsNumber()
  permanent_assignment_expiration_days: number;

  @ApiProperty({ example: 75, type: Number, required: true })
  @Transform(({ value }) => (value ? Number(value) : value))
  @IsNumber()
  permanent_assignment_offline_agent_days: number;

  @ApiProperty({ example: 75, type: Number, required: true })
  @Transform(({ value }) => (value ? Number(value) : value))
  @IsNumber()
  permanent_assignment_12_hours_limit_per_agent: number;

  @ApiProperty({ example: 75, type: Number, required: true })
  @Transform(({ value }) => (value ? Number(value) : value))
  @IsNumber()
  permanent_assignment_total_limit_per_agent: number;
}

class General {
  @ApiProperty({ example: 'Campaign Name', type: String, required: true })
  @IsString()
  name: string;

  @ApiProperty({
    example: 'Campaign Description',
    type: String,
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: true, type: Boolean, required: true })
  @IsBoolean()
  randomize_caller_id: boolean;

  @ApiProperty({ example: true, type: Boolean, required: true })
  @IsBoolean()
  is_active_campaign: boolean;

  @ApiProperty({ example: false, type: Boolean, required: true })
  @IsBoolean()
  mask_phone_numbers: boolean;

  @ApiProperty({ type: FeedbackPageSettings })
  @ValidateNested()
  @Type(() => FeedbackPageSettings)
  feedback_page_settings: FeedbackPageSettings;

  @ApiProperty({ type: PermanentAssignmentSettings })
  @ValidateNested()
  @Type(() => PermanentAssignmentSettings)
  permanent_assignment_settings: PermanentAssignmentSettings;
}

class CountryToCall {
  @ApiProperty({ example: 'USA', type: String, required: true })
  @IsString()
  country: string;

  @ApiProperty({ example: 'PST', type: String, required: true })
  @IsString()
  time_zone_of_selected_country: string;

  @ApiProperty({
    example: '2023-06-02T10:00:00Z',
    type: String,
    required: false,
  })
  @IsString()
  from: string;

  @ApiProperty({
    example: '2023-06-02T20:00:00Z',
    type: String,
    required: false,
  })
  @IsString()
  to: string;
}

class PredictiveDialerSettings {
  @ApiProperty({ example: 75, type: Number, required: true })
  @IsNumber()
  delay_before_showing_end_button: number;

  @ApiProperty({ example: 75, type: Number, required: true })
  @IsNumber()
  maximum_ringing_duration: number;

  @ApiProperty({ example: 75, type: Number, required: true })
  @IsNumber()
  call_connection_timeout: number;

  @ApiProperty({ example: 'No answer', type: String, required: true })
  @IsString()
  default_status_no_answer: string;

  @ApiProperty({ example: 75, type: Number, required: false })
  @IsOptional()
  @IsNumber()
  default_status_no_answer_value: number;

  @ApiProperty({ example: 'No answer', type: String, required: true })
  @IsString()
  default_status_busy_line: string;
  @ApiProperty({ example: 75, type: Number, required: false })
  @IsOptional()
  @IsNumber()
  default_status_busy_line_value: number;

  @ApiProperty({ example: 'No answer', type: String, required: true })
  @IsString()
  default_status_for_connection_error: string;
  @ApiProperty({ example: 75, type: Number, required: false })
  @IsOptional()
  @IsNumber()
  default_status_for_connection_error_value: number;
}

class CallHourSettings {
  @ApiProperty({
    example: '2023-06-02T10:00:00Z',
    type: String,
    required: true,
  })
  @IsString()
  covert_calling_hours_to: string;

  @ApiProperty({ type: [CountryToCall], required: true })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CountryToCall)
  country_to_call: CountryToCall[];
}

class DirectDialSettings {
  @ApiProperty({ example: 50, type: Number, required: true })
  @IsNumber()
  direct_dial_minimum_weight: number;

  @ApiProperty({ type: CallHourSettings })
  @ValidateNested()
  @Type(() => CallHourSettings)
  call_hour_settings: CallHourSettings;

  @ApiProperty({ type: PredictiveDialerSettings })
  @ValidateNested()
  @Type(() => PredictiveDialerSettings)
  predictive_dialer_settings: PredictiveDialerSettings;
}

class DroppedCallSettings {
  @ApiProperty({ example: 'No answer', type: String, required: true })
  @IsString()
  status_for_dropped_calls: string;

  @ApiProperty({ example: 1, type: Number, required: false })
  @IsOptional()
  @Transform(({ value }) => (value ? Number(value) : value))
  @IsNumber()
  status_for_dropped_calls_value: number;

  @ApiProperty({ example: 'audio-file-key.mp3', type: String, required: false })
  @IsString()
  @IsOptional()
  audio_file_key?: string;

  @ApiProperty({ example: '89000', type: Number, required: false })
  @IsOptional()
  @Transform(({ value }) => (value ? Number(value) : value))
  @IsNumber()
  audio_file_size?: number;

  @ApiProperty({ example: 30, type: Number, required: true })
  @IsNumber()
  wait_time_for_agent_availability: number;
}

class VoiceMailSettings {
  @ApiProperty({ example: 'No answer', type: String, required: true })
  @IsString()
  default_status_for_voice_mail: string;

  @ApiProperty({ example: 1, type: Number, required: false })
  @IsOptional()
  @Transform(({ value }) => (value ? Number(value) : value))
  @IsNumber()
  default_status_for_voice_mail_value: number;

  @ApiProperty({ example: 'No answer', type: String, required: true })
  @IsString()
  voice_mail_button_status?: string;

  @ApiProperty({ example: 1, type: Number, required: false })
  @IsOptional()
  @Transform(({ value }) => (value ? Number(value) : value))
  @IsNumber()
  voice_mail_button_status_value: number;

  @ApiProperty({ example: false, type: Boolean, required: true })
  @IsBoolean()
  hide_voice_mail_button_for_assigned_leads: boolean;

  @ApiProperty({ example: 5, type: Number, required: true })
  @Transform(({ value }) => (value ? Number(value) : value))
  @IsNumber()
  hide_voice_mail_button_after: number;

  @ApiProperty({ example: 10, type: Number, required: true })
  @Transform(({ value }) => (value ? Number(value) : value))
  @IsNumber()
  show_voice_mail_button_after: number;

  @ApiProperty({
    example: ANSWERING_MACHINE_DETECTION.OFF,
    required: true,
  })
  @IsEnum(ANSWERING_MACHINE_DETECTION)
  answering_machine_detection: ANSWERING_MACHINE_DETECTION;

  @ApiProperty({ example: 30, type: Number, required: false })
  @Transform(({ value }) => (value ? Number(value) : value))
  @IsNumber()
  maximum_answering_machine_detection_duration?: number;
}

export class LeadCampaignDto {
  @ApiProperty({ example: 10000, type: Number, required: false })
  @IsNumber()
  @IsOptional()
  total_leads?: number;

  @ApiProperty({ example: 9000, type: Number, required: false })
  @IsNumber()
  @IsOptional()
  available_leads?: number;

  @ApiProperty({
    description: 'Array containing a single status detail',
    type: StatusDto,
    required: true,
  })
  @ValidateNested({ each: true })
  @Type(() => StatusDto)
  status: [StatusDto];

  @ApiProperty({ type: General })
  @ValidateNested()
  @Type(() => General)
  general: General;

  @ApiProperty({ type: DirectDialSettings })
  @ValidateNested()
  @Type(() => DirectDialSettings)
  direct_dial_settings: DirectDialSettings;

  @ApiProperty({ type: DroppedCallSettings })
  @ValidateNested()
  @Type(() => DroppedCallSettings)
  dropped_call_settings: DroppedCallSettings;

  @ApiProperty({ type: VoiceMailSettings })
  @ValidateNested()
  @Type(() => VoiceMailSettings)
  voice_mail_settings: VoiceMailSettings;
}
