import { GetCommonQueryDTO } from '@common/dto/common-query.dto';
import { DURATION } from '@constant/reports/call-records';
import { OBJECT_TYPE_ID } from '@constant/workspace/calls';
import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsArray, IsDate, IsEnum, IsOptional, IsString } from 'class-validator';

export class CallRecordsRequestBodyFilter extends GetCommonQueryDTO {
  @ApiProperty({ example: 'greaterThan2mins' })
  @IsOptional()
  @IsEnum(DURATION)
  duration?: string;

  @ApiProperty({
    example: '+1234567890',
    description: 'Phone number of the call',
  })
  @IsOptional()
  @IsString()
  phone_number?: string;

  @ApiProperty({
    example: ['66c6eae3ca7b182f8de59aaaaa', '66c6eae3ca7b182f8de59bbbb'],
    description: 'List of User IDs and associated with the calls',
    isArray: true,
    type: String,
    required: false,
  })
  @IsArray()
  @IsOptional()
  agent?: string[];

  @ApiProperty({
    example: '2024-03-04T12:00:00Z',
    description: 'Time range where the time calculation needs to start',
  })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  start_time?: Date;

  @ApiProperty({
    example: '2024-03-04T12:00:00Z',
    description: 'Time range where the time calculation needs to end',
  })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  end_time?: Date;

  @ApiProperty({ example: 1, description: 'The type of call that was taken' })
  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsEnum(OBJECT_TYPE_ID)
  object_type_id?: number;
}
