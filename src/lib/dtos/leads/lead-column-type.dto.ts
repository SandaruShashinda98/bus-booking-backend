import { LEAD_COLUMN_TYPE } from '@constant/leads/leads';
import { IsEnum, IsArray, ArrayNotEmpty } from 'class-validator';

export class LeadColumnTypeDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsEnum(LEAD_COLUMN_TYPE, { each: true })
  dataTypes: LEAD_COLUMN_TYPE[];
}
