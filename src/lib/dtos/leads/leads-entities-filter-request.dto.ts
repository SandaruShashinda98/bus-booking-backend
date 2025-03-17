/**
 * This file contains the request Dtos for lead filters
 */
import { IsObjectID } from '@common/dto/object-id.path.dto';
import { LeadEntityFilterDto } from './leads-entities-filter.dto';
import { ApiProperty } from '@nestjs/swagger';
import { Types } from 'mongoose';
import { IsOptional } from 'class-validator';

export class CreateLeadFilterDto extends LeadEntityFilterDto {
  @ApiProperty({
    example: 'dj3hbd234hjb4bd5sb3db',
    description: 'obj id of the entity',
    type: String,
    required: true,
  })
  @IsObjectID()
  @IsOptional()
  _id: string | Types.ObjectId;
}
