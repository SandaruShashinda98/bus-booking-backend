import { CommonFieldsDTO } from '@common/dto/common-fields.dto';
import { IsObjectID } from '@common/dto/object-id.path.dto';
import { PERMISSIONS } from '@constant/authorization/roles';
import { ApiProperty } from '@nestjs/swagger';

//------------- filter roles ----------------
class FilterRoleResDTO extends CommonFieldsDTO {
  @ApiProperty({
    example: '10',
    description: 'weight of the user role',
    type: Number,
    required: true,
  })
  level: number;

  @ApiProperty({
    example: 'Admin',
    description: 'user role of admin',
    type: String,
    required: true,
  })
  role: string;

  @ApiProperty({
    example: 'this is the admin role',
    type: String,
    required: false,
  })
  description: string;

  @ApiProperty({
    example: 'true',
    description: 'cloned user role or not',
    type: Boolean,
    required: true,
  })
  is_clone: boolean;

  @ApiProperty({
    example: ['ACCESS_API_KEY', 'CREATE_WEBHOOK'],
    description: 'list of permissions',
    isArray: true,
    type: String,
    enum: PERMISSIONS,
  })
  permissions: PERMISSIONS[];

  @ApiProperty({
    example: ['123.345.50', '323.42.24.44'],
    description: 'list of accepted ips',
    isArray: true,
    type: String,
    required: false,
  })
  accepted_ips: string[];
}

export class FilterRolesResponseDTO {
  @ApiProperty({ type: [FilterRoleResDTO] })
  data: FilterRoleResDTO[];

  @ApiProperty({ type: Number })
  count: number;
}

//------------- create role ----------------
class CreateRoleResDTO extends CommonFieldsDTO {
  @ApiProperty({
    example: '10',
    description: 'weight of the user role',
    type: Number,
    required: true,
  })
  level: number;

  @ApiProperty({
    example: 'Admin',
    description: 'user role of admin',
    type: String,
    required: true,
  })
  role: string;

  @ApiProperty({
    example: 'this is the admin role',
    type: String,
    required: false,
  })
  description: string;

  @ApiProperty({
    example: 'true',
    description: 'cloned user role or not',
    type: Boolean,
    required: true,
  })
  is_clone: boolean;

  @ApiProperty({
    example: ['ACCESS_API_KEY', 'CREATE_WEBHOOK'],
    description: 'list of permissions',
    isArray: true,
    type: String,
    enum: PERMISSIONS,
  })
  permissions: PERMISSIONS[];

  @ApiProperty({
    example: ['123.345.5', '323.42.24.44'],
    description: 'list of accepted ips',
    isArray: true,
    type: String,
    required: false,
  })
  accepted_ips: string[];
}

//------------user with roles ---------
export class UserWithRoleResDTO {
  @ApiProperty({
    example: 'dj3hbd234hjb4bd5sb3db',
    description: 'obj id of the entity',
    type: String,
    required: true,
  })
  @IsObjectID()
  _id: string;

  @ApiProperty({
    example: 'agent1',
    description: 'First name of the user',
    type: String,
    required: true,
  })
  first_name: string;

  @ApiProperty({
    example: 'test',
    description: 'Last name of the user',
    type: String,
    required: true,
  })
  last_name: string;

  @ApiProperty({
    example: 'agent@gmail.com',
    description: 'Email address of the user',
    type: String,
    required: true,
  })
  email: string;
}

export class CreateRoleResponseDTO {
  @ApiProperty({ type: CreateRoleResDTO })
  data: CreateRoleResDTO;
}

export class GetAllUsersOfRoleResponseDTO {
  @ApiProperty({ type: [UserWithRoleResDTO] })
  data: UserWithRoleResDTO[];
}
