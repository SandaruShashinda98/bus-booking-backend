import { CommonEditFieldsRequestDTO } from '@common/dto/common-fields.dto';
import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  Max,
  ValidateNested,
} from 'class-validator';
import {
  FILTER_CONTROL,
  FILTER_GROUP_CONNECTOR,
  FILTER_GROUP_SETTING,
  FILTER_GROUP_STATE_OPTIONS,
  PREDICTIVE_TYPE,
  SORTING_METHOD,
} from '@constant/groups/groups';

export class FilterSettingsDTO {
  @ApiProperty({
    description: 'Filter group name',
    enum: FILTER_GROUP_SETTING,
    example: FILTER_GROUP_SETTING.CAMPAIGN,
    type: String,
  })
  @IsString()
  @IsOptional()
  filter_group: FILTER_GROUP_SETTING;

  @ApiProperty({
    enum: FILTER_GROUP_STATE_OPTIONS,
    example: FILTER_GROUP_STATE_OPTIONS.CONTAINS,
    description: 'Filter group state',
    type: String,
  })
  @IsString()
  @IsOptional()
  filter_group_state: FILTER_GROUP_STATE_OPTIONS;

  @ApiProperty({
    example: 'any',
    description: 'Input value for the filter',
  })
  @IsOptional()
  input_value: any;

  @ApiProperty({
    enum: FILTER_GROUP_CONNECTOR,
    example: FILTER_GROUP_CONNECTOR.AND,
    description: 'Logical connector',
    type: String,
  })
  @IsString()
  // @IsEnum(FILTER_GROUP_CONNECTOR)
  @IsOptional()
  connector: FILTER_GROUP_CONNECTOR;
}

export class FilterGroupDTO {
  @ApiProperty({
    example: 'status',
    description: 'Filter control type',
    type: String,
  })
  @IsString()
  @IsEnum(FILTER_CONTROL)
  @IsNotEmpty()
  filter_control: FILTER_CONTROL;

  @ApiProperty({
    example: 'Status Filter',
    description: 'Title of the filter group',
    type: String,
  })
  @IsString()
  @IsOptional()
  filter_group_title: string;

  @ApiProperty({
    example: '10',
    description: 'Weight value for the filter',
    type: String,
  })
  @IsString()
  @IsOptional()
  weight_value: string;

  @ApiProperty({
    type: [FilterSettingsDTO],
    description: 'Filter settings configuration',
  })
  @ValidateNested({ each: true })
  @Type(() => FilterSettingsDTO)
  @IsArray()
  @IsOptional()
  filter_settings: FilterSettingsDTO[];
}

export class CallRatioDTO {
  @ApiProperty({
    example: 1,
    description: 'Minimum call ratio',
    type: Number,
  })
  @Transform(({ value }) => Number(value))
  @IsNumber()
  @Min(0)
  @Max(10)
  min_call_ratio: number;

  @ApiProperty({
    example: 5,
    description: 'Maximum call ratio',
    type: Number,
  })
  @Transform(({ value }) => Number(value))
  @IsNumber()
  @Min(0)
  @Max(10)
  max_call_ratio: number;
}
export class LeadUploadFactorsDTO {
  @ApiProperty({
    example: 1,
    description: 'Lower lead upload factor',
    type: Number,
  })
  @Transform(({ value }) => Number(value))
  @IsNumber()
  @Min(0)
  @Max(6)
  lower_factor: number;

  @ApiProperty({
    example: 5,
    description: 'Upper lead upload factor',
    type: Number,
  })
  @Transform(({ value }) => Number(value))
  @IsNumber()
  @Min(0)
  @Max(6)
  upper_factor: number;
}

export class DropRatioThresholdDTO {
  @ApiProperty({
    example: 0.03,
    description: 'Hard drop rate',
    type: Number,
  })
  @Transform(({ value }) => Number(value))
  @IsNumber()
  @Min(0)
  @Max(10)
  hard_drop_rate: number;

  @ApiProperty({
    example: 0.05,
    description: 'Soft drop rate',
    type: Number,
  })
  @Transform(({ value }) => Number(value))
  @IsNumber()
  @Min(0)
  @Max(10)
  soft_drop_rate: number;

  @ApiProperty({
    example: 0.1,
    description: 'Hard ratio increment',
    type: Number,
  })
  @Transform(({ value }) => Number(value))
  @IsNumber()
  @Min(0)
  @Max(5)
  hard_ratio_increment: number;

  @ApiProperty({
    example: 0.1,
    description: 'Soft ratio increment',
    type: Number,
  })
  @Transform(({ value }) => Number(value))
  @IsNumber()
  @Min(0)
  @Max(5)
  soft_ratio_increment: number;
}

export class OptimalDropRateDTO {
  @ApiProperty({
    example: 0.02,
    description: 'Hard optimal drop rate',
    type: Number,
  })
  @Transform(({ value }) => Number(value))
  @IsNumber()
  @Min(0)
  @Max(10)
  hard_optimal_drop_rate: number;

  @ApiProperty({
    example: 0.03,
    description: 'Soft optimal drop rate',
    type: Number,
  })
  @Transform(({ value }) => Number(value))
  @IsNumber()
  @Min(0)
  @Max(10)
  soft_optimal_drop_rate: number;

  @ApiProperty({
    example: 0.1,
    description: 'Optimal ratio increment',
    type: Number,
  })
  @Transform(({ value }) => Number(value))
  @IsNumber()
  @Min(0)
  @Max(5)
  optimal_ratio_increment: number;
}

export class PredictiveSettingsDTO {
  @ApiProperty({
    enum: PREDICTIVE_TYPE,
    example: PREDICTIVE_TYPE.FIXED,
    description: 'Type of predictive dialing',
  })
  @IsEnum(PREDICTIVE_TYPE)
  @IsNotEmpty()
  predictive_type: PREDICTIVE_TYPE;

  @ApiProperty({
    enum: SORTING_METHOD,
    description: 'Method for sorting',
  })
  @IsEnum(SORTING_METHOD)
  @IsNotEmpty()
  sorting_method: SORTING_METHOD;

  @ApiProperty({
    example: true,
    description: 'Show feedback option',
    type: Boolean,
  })
  @IsBoolean()
  is_show_feedback: boolean;

  @ApiProperty({
    example: true,
    description: 'Show lead preview option',
    type: Boolean,
  })
  @IsBoolean()
  is_show_lead_preview: boolean;

  @ApiProperty({
    example: 300,
    description: 'Dialing start time before feedback end',
    type: Number,
  })
  @Transform(({ value }) => Number(value))
  @IsNumber()
  @Min(0)
  @Max(300)
  dialing_start_before_feedback_end: number;

  @ApiProperty({
    example: 1.5,
    description: 'Background dialing ratio',
    type: Number,
  })
  @Transform(({ value }) => Number(value))
  @IsNumber()
  @Min(0)
  @Max(100)
  background_dialing_ratio: number;

  @ApiProperty({
    example: 3,
    description: 'Fixed call ratio per agent',
    type: Number,
    required: false,
  })
  @Transform(({ value }) => Number(value))
  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(10)
  fixed_call_ratio_per_agent?: number;

  @ApiProperty({ type: LeadUploadFactorsDTO })
  @ValidateNested()
  @Type(() => LeadUploadFactorsDTO)
  @IsOptional()
  lead_upload_factors?: LeadUploadFactorsDTO;

  @ApiProperty({ type: CallRatioDTO })
  @ValidateNested()
  @Type(() => CallRatioDTO)
  @IsOptional()
  call_ratio?: CallRatioDTO;

  @ApiProperty({ type: DropRatioThresholdDTO })
  @ValidateNested()
  @Type(() => DropRatioThresholdDTO)
  drop_ratio_threshold: DropRatioThresholdDTO;

  @ApiProperty({ type: OptimalDropRateDTO })
  @ValidateNested()
  @Type(() => OptimalDropRateDTO)
  optimal_drop_rate: OptimalDropRateDTO;
}

//------------ create group request dto ---------
export class CreateGroupDTO {
  @ApiProperty({
    example: true,
    description: 'Indicates if the group is active',
    required: false,
    type: Boolean,
  })
  @IsBoolean()
  @IsOptional()
  is_active: boolean;

  @ApiProperty({
    example: 'Sales Team',
    description: 'Name of the group',
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  @Transform((param) => param.value.trim())
  name: string;

  @ApiProperty({
    example: 'Primary sales team group',
    description: 'Group description',
    type: String,
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    type: [FilterGroupDTO],
    description: 'Filter groups configuration',
  })
  @ValidateNested({ each: true })
  @Type(() => FilterGroupDTO)
  @IsArray()
  @IsOptional()
  filter_groups?: FilterGroupDTO[];

  @ApiProperty({
    type: [FilterGroupDTO],
    description: 'Previous Filter groups configuration',
  })
  @ValidateNested({ each: true })
  @Type(() => FilterGroupDTO)
  @IsArray()
  @IsOptional()
  previous_filter_groups?: FilterGroupDTO[];

  @ApiProperty({
    type: PredictiveSettingsDTO,
    description: 'Predictive settings configuration',
    required: false,
  })
  @ApiProperty({ type: PredictiveSettingsDTO })
  @ValidateNested()
  @Type(() => PredictiveSettingsDTO)
  @IsOptional()
  predictive_settings?: PredictiveSettingsDTO;

  @ApiProperty({
    example: 'skill group id',
    description: '324jn324io3n4kjn ',
    required: false,
  })
  @IsOptional()
  skill_group?: any;
}

//------------ update group request dto ---------
export class UpdateGroupDTO extends CommonEditFieldsRequestDTO {
  @ApiProperty({
    example: 'Sales Team',
    description: 'Name of the group',
    type: String,
    required: false,
  })
  @IsString()
  @IsOptional()
  @Transform((param) => param.value?.trim())
  name?: string;

  @ApiProperty({
    example: 'Primary sales team group',
    description: 'Group description',
    type: String,
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    type: [FilterGroupDTO],
    description: 'Filter groups configuration',
    required: false,
  })
  @ValidateNested({ each: true })
  @Type(() => FilterGroupDTO)
  @IsArray()
  @IsOptional()
  filter_groups?: FilterGroupDTO[];

  @ApiProperty({
    type: [FilterGroupDTO],
    description: 'Previous Filter groups configuration',
    required: false,
  })
  @ValidateNested({ each: true })
  @Type(() => FilterGroupDTO)
  @IsArray()
  @IsOptional()
  previous_filter_groups?: FilterGroupDTO[];

  @ApiProperty({
    type: PredictiveSettingsDTO,
    description: 'Predictive settings configuration',
    required: false,
  })
  @ValidateNested()
  @Type(() => PredictiveSettingsDTO)
  @IsOptional()
  predictive_settings?: PredictiveSettingsDTO;

  @ApiProperty({
    example: 'skill group id',
    description: '324jn324io3n4kjn ',
    required: false,
  })
  @IsOptional()
  skill_group?: any;
}
