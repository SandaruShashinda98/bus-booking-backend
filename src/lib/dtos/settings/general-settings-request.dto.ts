import { CommonEditFieldsRequestDTO } from '@common/dto/common-fields.dto';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEnum,
  IsOptional,
  IsNumber,
  ValidateNested,
} from 'class-validator';
import {
  DIGITS_TO_SHOW,
  TIME_ZONES,
  WEEK_START,
} from '@constant/settings/settings';
import {
  IGeneralSettings,
  ISettings,
} from '@interface/settings/general-settings';

export class GeneralSettingsDTO implements IGeneralSettings {
  @ApiProperty({
    example: false,
    description: 'Indicates if the phone number should be masked',
    required: false,
    type: Boolean,
  })
  @IsBoolean()
  @IsOptional()
  is_phone_number_masked: boolean;

  @ApiProperty({
    example: DIGITS_TO_SHOW.SHOW_FIRST_DIGITS,
    description: 'Which digits to show in masked numbers',
    enum: DIGITS_TO_SHOW,
    required: false,
    type: String,
  })
  @IsEnum(DIGITS_TO_SHOW)
  @IsOptional()
  digits_to_show: DIGITS_TO_SHOW;

  @ApiProperty({
    example: 4,
    description: 'Number of digits to display when masking',
    required: false,
    type: Number,
  })
  @IsNumber()
  @IsOptional()
  digits_counts_to_display: number;

  @ApiProperty({
    example: TIME_ZONES.UTC,
    description: 'Default time zone setting',
    enum: TIME_ZONES,
    required: false,
    type: String,
  })
  @IsEnum(TIME_ZONES)
  @IsOptional()
  time_zones: TIME_ZONES;

  @ApiProperty({
    example: WEEK_START.MONDAY,
    description: 'First day of the week setting',
    enum: WEEK_START,
    required: false,
    type: String,
  })
  @IsEnum(WEEK_START)
  @IsOptional()
  week_start: WEEK_START;
}

export class SettingsRequestDTO
  extends CommonEditFieldsRequestDTO
  implements ISettings
{
  @ApiProperty({
    description: 'General settings configuration',
    type: GeneralSettingsDTO,
    required: false,
  })
  @IsOptional()
  general_settings: GeneralSettingsDTO;

  @ApiProperty({
    example: false,
    description: 'Enable/disable IP Access Control List',
    required: false,
    type: Boolean,
  })
  @IsBoolean()
  @IsOptional()
  is_ip_acl_enabled: boolean;
}
