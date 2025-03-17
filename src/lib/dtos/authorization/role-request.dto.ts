import { CommonEditFieldsRequestDTO } from '@common/dto/common-fields.dto';
import { PERMISSIONS } from '@constant/authorization/roles';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateRoleDTO {
  @ApiProperty({
    example: true,
    description: 'Indicates if the role is active',
    required: false,
    type: Boolean,
  })
  @IsBoolean()
  @IsOptional()
  is_active: boolean;

  @ApiProperty({
    example: 'Admin',
    description: 'user role of admin',
    type: String,
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  @Transform((subject) => subject.value.trim())
  role: string;

  @ApiProperty({
    example: 'this is the admin role',
    type: String,
    required: false,
  })
  @IsString()
  @IsOptional()
  description: string;

  @ApiProperty({
    example: ['ACCESS_API_KEY', 'CREATE_WEBHOOK'],
    description: 'list of permissions',
    isArray: true,
    type: String,
    enum: PERMISSIONS,
  })
  @IsArray()
  @IsEnum(PERMISSIONS, { each: true })
  @IsNotEmpty()
  permissions: PERMISSIONS[];

  // @ApiProperty({
  //   example: ['123.345.5', '323.42.24.44'],
  //   description: 'list of accepted ips',
  //   isArray: true,
  //   type: String,
  //   required: false,
  // })
  // @IsOptional()
  // accepted_ips: string[];

  @ApiProperty({
    example: 'true',
    description: 'cloned user role or not',
    type: Boolean,
    required: true,
  })
  @IsBoolean()
  @IsOptional()
  is_clone: boolean;

  // @ApiProperty({
  //   example: true,
  //   description: 'Indicates if the phone is masked or not',
  //   required: false,
  //   type: Boolean,
  // })
  // @IsBoolean()
  // @IsOptional()
  // is_phone_masked: boolean;
}

export class UpdateRoleDTO extends CommonEditFieldsRequestDTO {
  @ApiProperty({
    example: 'Admin',
    description: 'user role of admin',
    type: String,
    required: false,
  })
  @IsString()
  @IsOptional()
  @Transform((subject) => subject?.value?.trim())
  role: string;

  @ApiProperty({
    example: 'this is the admin role',
    type: String,
    required: false,
  })
  @IsString()
  @IsOptional()
  description: string;

  @ApiProperty({
    example: ['ACCESS_API_KEY', 'CREATE_WEBHOOK'],
    description: 'list of permissions',
    isArray: true,
    type: String,
    enum: PERMISSIONS,
    required: false,
  })
  @IsArray()
  @IsEnum(PERMISSIONS, { each: true })
  @IsOptional()
  permissions: PERMISSIONS[];

  // @ApiProperty({
  //   example: ['123.345.5', '323.42.24.44'],
  //   description: 'list of accepted ips',
  //   isArray: true,
  //   type: String,
  //   required: false,
  // })
  // @IsArray()
  // @IsOptional()
  // accepted_ips: string[];

  @ApiProperty({
    example: 'true',
    description: 'cloned user role or not',
    type: Boolean,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  is_clone: boolean;

  // @ApiProperty({
  //   example: true,
  //   description: 'Indicates if the phone is masked or not',
  //   required: false,
  //   type: Boolean,
  // })
  // @IsBoolean()
  // @IsOptional()
  // is_phone_masked: boolean;
}

export class UserChangeRoleDTO {
  user: string;
  roles: string[];
}

export class DeleteRoleDTO {
  @ApiProperty({
    example: [
      {
        user: '66c6eae3ca7b182f8de59ffff',
        roles: ['66c6eae3ca7b182f8de59aaaaa', '66c6eae3ca7b182f8de59bbbb'],
      },
    ],
    description: 'List of User IDs and List of Roles to be Assigned',
    isArray: true,
    type: UserChangeRoleDTO,
    required: false,
  })
  @IsArray()
  @IsOptional()
  usersAndNewRoles: UserChangeRoleDTO[];
}
