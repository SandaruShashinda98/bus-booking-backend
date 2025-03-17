import {
  CommonEditFieldsRequestDTO,
  KeyValueDTO,
} from '@common/dto/common-fields.dto';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsNumber,
  IsDate,
  IsArray,
  IsBoolean,
  ValidateNested,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { IsObjectID } from '@common/dto/object-id.path.dto';

class LeadDetailsDto {
  @ApiProperty({ example: 'lead_id', type: String, required: false })
  @IsString()
  @IsOptional()
  lead_id?: string;

  @ApiProperty({ example: 'John', type: String, required: false })
  @IsString()
  @IsOptional()
  first_name?: string;

  @ApiProperty({ example: 'Doe', type: String, required: false })
  @IsString()
  @IsOptional()
  last_name?: string;

  @ApiProperty({ example: '+1234567890', type: String, required: false })
  @IsString()
  @IsOptional()
  phone_number?: string;

  @ApiProperty({ example: '1234567890', type: String, required: false })
  @IsString()
  @IsOptional()
  phone_number_normalized?: string;

  @ApiProperty({ example: '+0987654321', type: String, required: false })
  @IsString()
  @IsOptional()
  secondary_phone?: string;

  @ApiProperty({
    example: 'john.doe@example.com',
    type: String,
    required: false,
  })
  @IsString()
  @IsOptional()
  email?: string;

  @ApiProperty({ example: 30, type: Number, required: false })
  @IsNumber()
  @IsOptional()
  @Transform(({ value }) => (value ? Number(value) : value))
  age?: number;

  @ApiProperty({ example: 'Bachelors Degree', type: String, required: false })
  @IsString()
  @IsOptional()
  education?: string;

  @ApiProperty({ example: '123 Main St', type: String, required: false })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiProperty({ example: 'New York', type: String, required: false })
  @IsString()
  @IsOptional()
  city?: string;

  @ApiProperty({ example: 'NY', type: String, required: false })
  @IsString()
  @IsOptional()
  state?: string;

  @ApiProperty({ type: [KeyValueDTO], required: false })
  @IsOptional()
  country?: KeyValueDTO<string, string>[];

  @ApiProperty({ type: [KeyValueDTO], required: false })
  @IsOptional()
  time_zone?: KeyValueDTO<string, string>[];
}

class CampaignsAndEngagementDetailsDto {
  @ApiProperty({ type: [KeyValueDTO], required: false })
  @IsOptional()
  campaign?: KeyValueDTO<string, string>[];

  @ApiProperty({ type: [KeyValueDTO], required: false })
  @IsOptional()
  status?: KeyValueDTO<string, string>[];

  @ApiProperty({ type: [KeyValueDTO], required: false })
  @IsOptional()
  availability?: KeyValueDTO<string, string>[];

  @ApiProperty({ example: 75, type: Number, required: false })
  @IsNumber()
  @IsOptional()
  @Transform(({ value }) => (value ? Number(value) : value))
  weight?: number;

  @ApiProperty({ example: 3, type: Number, required: false })
  @IsNumber()
  @IsOptional()
  @Transform(({ value }) => (value ? Number(value) : value))
  calls?: number;

  @ApiProperty({ type: [KeyValueDTO], required: false })
  @IsOptional()
  sub_status?: KeyValueDTO<string, string>[];

  @ApiProperty({ type: [KeyValueDTO], required: false })
  @IsOptional()
  lead_state?: KeyValueDTO<string, string>[];

  @ApiProperty({ type: [KeyValueDTO], required: false })
  @IsOptional()
  hlr?: KeyValueDTO<string, string>[];

  @ApiProperty({ required: false })
  @IsOptional()
  funnel?: unknown;

  @ApiProperty({ required: false })
  @IsOptional()
  tag?: unknown;

  @ApiProperty({ example: '123', type: String, required: false })
  @IsString()
  @IsOptional()
  original_identifier?: number;

  @ApiProperty({ example: '2023-06-02T10:00:00Z', type: Date, required: false })
  @IsDate()
  @Type(() => Date)
  @IsOptional()
  start_lead_period?: Date;

  @ApiProperty({ example: '2023-06-02T10:00:00Z', type: Date, required: false })
  @IsDate()
  @Type(() => Date)
  @IsOptional()
  end_lead_period?: Date;

  @ApiProperty({ example: '2023-06-02T10:00:00Z', type: Date, required: false })
  // @IsDate()
  // @Type(() => Date)
  @IsOptional()
  call_after?: Date;

  @ApiProperty({ type: [KeyValueDTO], required: false })
  @IsOptional()
  assign_to?: KeyValueDTO<string, string>[];

  @ApiProperty({ required: false })
  @IsOptional()
  duplicate?: unknown;

  @ApiProperty({ required: false })
  @IsOptional()
  with_error?: unknown;

  @ApiProperty({ required: false })
  @IsOptional()
  brm_info?: unknown;

  @ApiProperty({
    example: 'Interested, please call back',
    type: String,
    required: false,
  })
  @IsString()
  @IsOptional()
  sms_reply?: string;

  @ApiProperty({ example: 5, type: Number, required: false })
  @IsNumber()
  @IsOptional()
  @Transform(({ value }) => (value ? Number(value) : value))
  experience?: number;

  @ApiProperty({
    example: 'Lead showed high interest',
    type: String,
    required: false,
  })
  @IsString()
  @IsOptional()
  explanation?: string;

  @ApiProperty({
    example: 'Follow up next week',
    type: String,
    required: false,
  })
  @IsString()
  @IsOptional()
  notes?: string;
}

class SystemDetailsDto {
  @ApiProperty({ type: [KeyValueDTO], required: false })
  @IsOptional()
  lead_file_name?: KeyValueDTO<string, string>[];

  @ApiProperty({ example: 'api_user_1', type: String, required: false })
  @IsString()
  @IsOptional()
  api_user?: string;

  @ApiProperty({ type: [KeyValueDTO], required: false })
  @IsOptional()
  created_at?: KeyValueDTO<string, string>[];

  @ApiProperty({ type: [KeyValueDTO], required: false })
  @IsOptional()
  updated_at?: KeyValueDTO<string, string>[];

  @ApiProperty({ example: false, type: Boolean, required: false })
  @IsBoolean()
  @IsOptional()
  is_deleted?: boolean;
}

export class LeadEntityFilterDto extends CommonEditFieldsRequestDTO {
  @ApiProperty({
    example: 'dj3hbd234hjb4bd5sb3db',
    description: 'obj id of the entity',
    type: String,
    required: true,
  })
  @IsObjectID()
  @IsOptional()
  _id: any;

  @ApiProperty({ example: 'Country Filter', type: String, required: false })
  @IsString()
  @IsOptional()
  filter_name?: string;

  @ApiProperty({ type: LeadDetailsDto, required: false })
  @ValidateNested()
  @Type(() => LeadDetailsDto)
  @IsOptional()
  lead_details?: LeadDetailsDto;

  @ApiProperty({ type: CampaignsAndEngagementDetailsDto, required: false })
  @ValidateNested()
  @Type(() => CampaignsAndEngagementDetailsDto)
  @IsOptional()
  campaigns_and_engagement_details?: CampaignsAndEngagementDetailsDto;

  @ApiProperty({ type: SystemDetailsDto, required: false })
  @ValidateNested()
  @Type(() => SystemDetailsDto)
  @IsOptional()
  system_details?: SystemDetailsDto;

  @ApiProperty({ example: ['tag1', 'tag2'], type: [String], required: false })
  @IsArray()
  @IsOptional()
  custom?: string[];
}
