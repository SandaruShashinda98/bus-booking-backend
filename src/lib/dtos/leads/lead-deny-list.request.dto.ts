import { LEAD_DENY_STATUS } from '@constant/leads/leads';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
} from 'class-validator';

export class CompleteAddCSVDto {
  @ApiProperty({
    type: Boolean,
    required: true,
  })
  @IsBoolean()
  preApproved: boolean;
}

export class CompleteAddMultiPartCSVDto {
  @ApiProperty({
    type: Boolean,
    required: true,
  })
  @IsBoolean()
  preApproved: boolean;

  @ApiProperty({
    type: String,
    required: true,
  })
  @IsString()
  uploadId: string;

  @ApiProperty({
    description:
      'Array of parts that have been uploaded. Each part contains the ETag and PartNumber.',
    example: [
      { ETag: '"80c485b74036e1c6cbb33a04b7b96ddd"', PartNumber: 1 },
      { ETag: '"499f6c3e6c53de2bba47d4b9dccb04e3"', PartNumber: 2 },
    ],
  })
  @IsArray()
  parts: { ETag: string; PartNumber: number }[];
}

export class DenyStatusChangeDto {
  @ApiProperty({
    description: 'The status of the deny to be changed',
    example: 'ALLOWED',
  })
  @IsEnum(LEAD_DENY_STATUS)
  status: LEAD_DENY_STATUS;

  @ApiProperty({
    description: 'The status of the deny to be changed',
    example: 'ALLOWED',
  })
  @IsOptional()
  @IsEnum(LEAD_DENY_STATUS)
  current_status: LEAD_DENY_STATUS;

  @ApiProperty({
    description: 'IDs of the leads to be modified',
    example: '671f39092cc4eedd5bf18fd2',
  })
  @IsArray()
  @IsOptional()
  selected_ids?: string[];

  @ApiProperty({
    description: 'Filter information',
  })
  @IsOptional()
  filter?: unknown;

  @ApiProperty({
    description: 'The condition of processing all the leads or not',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  is_all?: boolean;
}
