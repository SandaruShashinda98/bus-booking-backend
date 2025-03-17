/**
 * This file contains the lead filter Dto for responses
 */
import { ApiProperty } from '@nestjs/swagger';
import { LeadEntityFilterDto } from './leads-entities-filter.dto';

export class FilterLeadEntityFilterResponseDto {
  @ApiProperty({ type: [LeadEntityFilterDto] })
  data: LeadEntityFilterDto[];

  @ApiProperty({ type: Number })
  count: number;
}

export class LeadEntityFilterResponseDto extends LeadEntityFilterDto {}
