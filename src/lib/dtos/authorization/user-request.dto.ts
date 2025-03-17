import { CommonEditFieldsRequestDTO } from '@common/dto/common-fields.dto';
import { IsObjectID } from '@common/dto/object-id.path.dto';
import {
  SIP_SETTINGS,
  TWO_FACTOR_AUTHENTICATION_TYPE,
  USER_STATUS,
} from '@constant/authorization/user';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsString,
  IsNotEmpty,
  IsEmail,
  IsArray,
  IsNumber,
  IsEnum,
  IsOptional,
  IsBoolean,
} from 'class-validator';

export class CreateUserDTO extends CommonEditFieldsRequestDTO {
  @ApiProperty({
    example: 'dj3hbd234hjb4bd5sb3db',
    description:
      'obj id of the entity (if creating _id is not required else required)',
    type: String,
    required: false,
  })
  @IsOptional()
  @IsObjectID()
  _id: any;

  @ApiProperty({ example: 'John', type: String, required: true })
  @IsString()
  @Transform((subject) => subject.value.trim())
  @IsNotEmpty()
  first_name: string;

  @ApiProperty({ example: 'Doe', type: String, required: true })
  @IsString()
  @Transform((subject) => subject.value.trim())
  @IsNotEmpty()
  last_name: string;

  @ApiProperty({
    example: 'john.doe@example.com',
    type: String,
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  @IsEmail()
  @Transform((subject) => subject.value.trim().toLowerCase())
  email: string;

  @ApiProperty({ example: 'johnDoe', type: String, required: true })
  @IsString()
  @IsNotEmpty()
  @Transform((subject) => subject.value.trim())
  username: string;

  @ApiProperty({ example: 'johnDoe@123', type: String, required: false })
  @IsString()
  @IsOptional()
  password: string;

  @ApiProperty({
    example: ['wdw43ref423we3f', 'd3h6fd8dh7v8'],
    isArray: true,
    required: true,
  })
  @IsArray()
  @IsNotEmpty()
  role: string[];

  @ApiProperty({ example: 1234, type: Number, required: false })
  @IsNumber()
  @IsOptional()
  virtual_extension: number;

  @ApiProperty({
    example: ['device1', 'device2'],
    isArray: true,
    required: false,
  })
  @IsArray()
  @IsOptional()
  devices?: string[];

  @ApiProperty({ example: new Date(), type: Date, required: false })
  @IsOptional()
  last_login?: Date;

  @ApiProperty({
    example: '["1231v3jhv3131","c2ncu34uw09283v"]',
    type: [String],
    required: false,
  })
  @IsArray()
  @IsOptional()
  desks: string[];

  @ApiProperty({ example: false, type: Boolean, required: false })
  @IsBoolean()
  @IsOptional()
  add_to_currant_and_future_desks: boolean;

  @ApiProperty({
    example: '["1231v3jhv3131","c2ncu34uw09283v"]',
    type: [String],
    required: false,
  })
  @IsArray()
  @IsOptional()
  skill_groups: string[];

  @ApiProperty({ example: false, type: Boolean, required: false })
  @IsBoolean()
  @IsOptional()
  add_to_currant_and_future_skill_groups: boolean;

  @ApiProperty({ example: false, type: Boolean, required: false })
  @IsBoolean()
  @IsOptional()
  is_assign_leads: boolean;

  @ApiProperty({
    example: SIP_SETTINGS.USE_OUTSOURCED_SOFT_PHONE,
    enum: SIP_SETTINGS,
    required: false,
  })
  @IsEnum(SIP_SETTINGS)
  @IsOptional()
  sip_setting: SIP_SETTINGS;

  @ApiProperty({
    example: TWO_FACTOR_AUTHENTICATION_TYPE.DISABLED,
    enum: TWO_FACTOR_AUTHENTICATION_TYPE,
    required: false,
  })
  @IsEnum(TWO_FACTOR_AUTHENTICATION_TYPE)
  @IsOptional()
  two_factor_authentication_type: TWO_FACTOR_AUTHENTICATION_TYPE;

  @ApiProperty({ example: 5, type: Number, required: false })
  @IsNumber()
  @IsOptional()
  max_concurrent_sessions: number;

  @ApiProperty({
    description: 'Group id associated with this skill group',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false,
  })
  @IsOptional()
  group?: any;
}
export class UpdateUserDTO extends CommonEditFieldsRequestDTO {
  @ApiProperty({ example: 'John', type: String, required: true })
  @IsString()
  @IsOptional()
  @Transform((subject) => subject?.value?.trim())
  first_name: string;

  @ApiProperty({ example: 'Doe', type: String, required: true })
  @IsString()
  @IsOptional()
  @Transform((subject) => subject?.value?.trim())
  last_name: string;

  @ApiProperty({
    example: 'john.doe@example.com',
    type: String,
    required: true,
  })
  @IsString()
  @IsOptional()
  @IsEmail()
  @Transform((subject) => subject?.value?.trim()?.toLowerCase())
  email: string;

  @ApiProperty({ example: 'johnDoe', type: String, required: true })
  @IsString()
  @IsOptional()
  username: string;

  @ApiProperty({
    example: ['wdw43ref423we3f', 'd3h6fd8dh7v8'],
    isArray: true,
    required: true,
  })
  @IsArray()
  @IsOptional()
  role: string[];

  @ApiProperty({ example: 1234, type: Number, required: false })
  @IsNumber()
  @IsOptional()
  virtual_extension: number;

  @ApiProperty({ example: false, type: Boolean, required: false })
  @IsBoolean()
  @IsOptional()
  add_to_currant_and_future_desks: boolean;

  @ApiProperty({
    example: '["1231v3jhv3131","c2ncu34uw09283v"]',
    type: [String],
    required: true,
  })
  @IsArray()
  @IsOptional()
  desks: string[];

  @ApiProperty({ example: false, type: Boolean, required: false })
  @IsBoolean()
  @IsOptional()
  add_to_currant_and_future_skill_groups: boolean;

  @ApiProperty({
    example: '["1231v3jhv3131","c2ncu34uw09283v"]',
    type: [String],
    required: true,
  })
  @IsArray()
  @IsOptional()
  skill_groups: string[];

  @ApiProperty({ example: false, type: Boolean, required: false })
  @IsBoolean()
  @IsOptional()
  is_assign_leads: boolean;

  @ApiProperty({
    example: SIP_SETTINGS.USE_OUTSOURCED_SOFT_PHONE,
    enum: SIP_SETTINGS,
    required: false,
  })
  @IsEnum(SIP_SETTINGS)
  @IsOptional()
  sip_setting: SIP_SETTINGS;

  @ApiProperty({
    example: TWO_FACTOR_AUTHENTICATION_TYPE.DISABLED,
    enum: TWO_FACTOR_AUTHENTICATION_TYPE,
    required: false,
  })
  @IsEnum(TWO_FACTOR_AUTHENTICATION_TYPE)
  @IsOptional()
  two_factor_authentication_type: TWO_FACTOR_AUTHENTICATION_TYPE;

  @ApiProperty({ example: 5, type: Number, required: false })
  @IsNumber()
  @IsOptional()
  max_concurrent_sessions: number;

  @ApiProperty({
    description: 'Group id associated with this skill group',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false,
  })
  @IsOptional()
  group?: any;
}

export class UpdateUserStatusDto {
  @IsEnum(USER_STATUS, { message: 'Invalid status provided' })
  status: USER_STATUS;
}
