import { GetCommonQueryDTO } from '@common/dto/common-query.dto';
import { ACTIVE_STATE, MISC_TYPE } from '@constant/authorization/user';
import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsOptional,
  IsString,
  IsNumber,
  IsArray,
  IsEnum,
  IsObject,
  IsNotEmpty,
  IsMongoId,
} from 'class-validator';
import { Types } from 'mongoose';

export class FilterUserMiscDataDto extends GetCommonQueryDTO {
  @ApiProperty({
    example: MISC_TYPE.DESK,
    enum: MISC_TYPE,
    required: true,
  })
  @IsEnum(MISC_TYPE)
  @IsNotEmpty()
  @IsString()
  type?: MISC_TYPE;
}
export class FilterUsersDto extends GetCommonQueryDTO {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @Transform((subject) => subject?.value?.trim()?.toLowerCase())
  email?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  username?: string;

  @ApiProperty({ required: false, type: [String] })
  @IsOptional()
  @IsArray()
  role?: string[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  virtual_extension?: number;
}

export class FilterObjectDto {
  @ApiProperty({
    example: ACTIVE_STATE.ALL,
    enum: ACTIVE_STATE,
    required: false,
  })
  @IsEnum(ACTIVE_STATE)
  @IsOptional()
  @IsString()
  active_state?: ACTIVE_STATE;

  @ApiProperty({
    example: ['66c6eae2ca7b182f8de59f44', '66c9f29772c24e689d9a84c3'],
    type: [String],
    required: false,
  })
  @IsOptional()
  @IsArray()
  deskIds?: string[];

  @ApiProperty({
    example: ['66c6eae2ca7b182f8de59f44', '66c9f29772c24e689d9a84c3'],
    type: [String],
    required: false,
  })
  @IsOptional()
  @IsArray()
  groupIds?: string[];

  @ApiProperty({
    example: ['66c6eae2ca7b182f8de59f44', '66c9f29772c24e689d9a84c3'],
    type: [String],
    required: false,
  })
  @IsOptional()
  @IsArray()
  skillGroupIds?: string[];

  @ApiProperty({
    example: ['66c6eae2ca7b182f8de59f44', '66c9f29772c24e689d9a84c3'],
    type: [String],
    required: false,
  })
  @IsOptional()
  @IsArray()
  roleIds?: string[];

  @ApiProperty({
    example: ['iphone', 'mac book'],
    type: [String],
    required: false,
  })
  @IsOptional()
  @IsArray()
  sip_device?: string[];
}
export class FilterUsersMetaDataDto extends GetCommonQueryDTO {
  @ApiProperty({
    example: {
      active_state: ACTIVE_STATE.ALL,
      deskIds: ['66c6eae2ca7b182f8de59f44', '66c9f29772c24e689d9a84c3'],
      groupIds: ['66c6eae2ca7b182f8de59f44', '66c9f29772c24e689d9a84c3'],
      skillGroupIds: ['66c6eae2ca7b182f8de59f44', '66c9f29772c24e689d9a84c3'],
      roleIds: ['66c6eae2ca7b182f8de59f44', '66c9f29772c24e689d9a84c3'],
      sip_device: ['iphone', 'mac book'],
    },
    required: false,
  })
  @IsObject()
  @IsOptional()
  filter: FilterObjectDto;
}

export class DataToCheckDto {
  @ApiProperty({
    example: 'Dwayne',
    required: true,
  })
  @IsString()
  username: string;

  @ApiProperty({
    example: 'dwayne@johnson.com',
    required: true,
  })
  @IsString()
  @Transform((subject) => subject?.value?.trim()?.toLowerCase())
  email: string;

  @ApiProperty({
    example: '67b5ce43039895d0862f597e',
    required: false,
    type: Types.ObjectId,
  })
  @IsOptional()
  @IsMongoId()
  _id?: string;
}
