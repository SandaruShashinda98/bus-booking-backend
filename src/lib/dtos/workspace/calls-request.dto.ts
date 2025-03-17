import { CommonEditFieldsRequestDTO } from '@common/dto/common-fields.dto';
import { GetCommonQueryDTO } from '@common/dto/common-query.dto';
import {
  SYSTEM_STATUS,
  FEEDBACK_STATUS,
  HANGUP_DISPOSITION,
  OBJECT_TYPE_ID,
} from '@constant/workspace/calls';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsString,
  IsOptional,
  IsEnum,
  IsDate,
  ValidateNested,
} from 'class-validator';

export class AudioData {
  @ApiProperty({
    example: 'file1',
    description: 'name of the uploaded file',
  })
  @IsOptional()
  @IsString()
  name: string;
}

export class CallsRequestQueryDto extends GetCommonQueryDTO {
  @ApiProperty({
    example: '+1234567890',
    description: 'Phone number of the call',
  })
  @IsOptional()
  @IsString()
  phone_number?: string;

  @ApiProperty({
    description: 'The status of the call',
    example: 'BUSY',
    enum: SYSTEM_STATUS,
  })
  @IsOptional()
  @IsEnum(SYSTEM_STATUS)
  system_status?: number;

  @ApiProperty({
    example: 'NETWORK_FAILURE',
    description: 'The reason the call was hangup',
  })
  @IsOptional()
  @IsEnum(FEEDBACK_STATUS)
  feedback_status: number;

  @ApiProperty({
    example: 'NETWORK_FAILURE',
    description: 'The reason the call was hangup',
  })
  @IsOptional()
  @IsEnum(HANGUP_DISPOSITION)
  hangup_disposition: number;

  @ApiProperty({
    example: '2024-03-04T12:00:00Z',
    description: 'Time when the call was initiated',
  })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  initiated_time?: Date;

  @ApiProperty({
    example: '2024-03-04T12:02:00Z',
    description: 'Time when the call was answered',
  })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  answered_time?: Date;

  @ApiProperty({
    example: '2024-03-04T12:05:00Z',
    description: 'Time when the call ended',
  })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  end_time?: Date;

  @ApiProperty({ example: 1, description: 'The type of call that was taken' })
  @IsOptional()
  @IsEnum(OBJECT_TYPE_ID)
  object_type_id: number;
}

export class InitiateCallRequestBody {
  @ApiProperty({
    example: '+1234567890',
    description: 'Phone number of the call',
  })
  @IsString()
  call_id: string;

  @ApiProperty({
    example: '+1234567890',
    description: 'Phone number of the call',
  })
  @IsString()
  phone_number: string;

  @ApiProperty({ example: 1, description: 'The type of call that was taken' })
  @IsEnum(OBJECT_TYPE_ID)
  object_type_id: number;
}

export class UpdateCallDto extends CommonEditFieldsRequestDTO {
  @ApiProperty({
    example: '+1234567890',
    description: 'Phone number of the call',
  })
  @IsOptional()
  @IsString()
  call_id?: string;

  @ApiProperty({
    example: '+1234567890',
    description: 'Phone number of the call',
  })
  @IsOptional()
  @IsString()
  phone_number?: string;

  @ApiProperty({
    description: 'The status of the call',
    example: 'BUSY',
    enum: SYSTEM_STATUS,
  })
  @IsOptional()
  @IsEnum(SYSTEM_STATUS)
  system_status?: number;

  @ApiProperty({
    example: 'NETWORK_FAILURE',
    description: 'The reason the call was hangup',
  })
  @IsOptional()
  @IsEnum(FEEDBACK_STATUS)
  feedback_status: number;

  @ApiProperty({
    example: 'NETWORK_FAILURE',
    description: 'The reason the call was hangup',
  })
  @IsOptional()
  @IsEnum(HANGUP_DISPOSITION)
  hangup_disposition: number;

  @ApiProperty({
    example: '2024-03-04T12:02:00Z',
    description: 'Time when the call was answered',
  })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  answered_time?: Date;

  @ApiProperty({
    example: '2024-03-04T12:05:00Z',
    description: 'Time when the call ended',
  })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  end_time?: Date;

  @ApiProperty({
    example: {
      url: '12e3443c222-eee',
      name: '123ew222333',
    },
    description: 'audio upload data',
  })
  @ValidateNested()
  @Type(() => AudioData)
  audio_data: AudioData;
}
