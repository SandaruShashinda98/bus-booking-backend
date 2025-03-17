import { CommonFieldsDTO } from '@common/dto/common-fields.dto';
import { IsObjectID } from '@common/dto/object-id.path.dto';
import {
  SIP_SETTINGS,
  TWO_FACTOR_AUTHENTICATION_TYPE,
  USER_STATUS,
} from '@constant/authorization/user';
import { ApiProperty } from '@nestjs/swagger';

//------------- create user ----------------
class UserResDTO extends CommonFieldsDTO {
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

  @ApiProperty({
    example: 'agent1',
    description: 'Username of the user',
    type: String,
    required: true,
  })
  username: string;

  @ApiProperty({
    example: ['AGENT'],
    description: 'Roles assigned to the user',
    isArray: true,
    type: String,
    required: true,
  })
  role: string[];

  @ApiProperty({
    example: ['Mac M1', 'Windows Laptop', 'Iphone 13'],
    description: 'Devices assigned to the user',
    type: [String],
    required: false,
  })
  devices: string[];

  @ApiProperty({
    example: new Date(),
    description: 'Last login date time',
    type: Date,
    required: false,
  })
  last_login?: Date;

  @ApiProperty({
    example: false,
    description: 'Add user to current and future desks',
    type: Boolean,
    required: false,
  })
  add_to_currant_and_future_desks: boolean;

  @ApiProperty({
    example: false,
    description: 'Add user to current and future skill groups',
    type: Boolean,
    required: false,
  })
  add_to_currant_and_future_skill_groups: boolean;

  @ApiProperty({
    example: false,
    description: 'Assign leeds to user',
    type: Boolean,
    required: false,
  })
  is_assign_leads: boolean;

  @ApiProperty({
    example: SIP_SETTINGS.USE_OUTSOURCED_SOFT_PHONE,
    description:
      'special kind of signaling protocol designed to control communication sessions',
    enum: SIP_SETTINGS,
    required: false,
  })
  sip_setting: SIP_SETTINGS;

  @ApiProperty({
    example: TWO_FACTOR_AUTHENTICATION_TYPE.DISABLED,
    description: '2 factor authentication type',
    enum: TWO_FACTOR_AUTHENTICATION_TYPE,
    required: false,
  })
  two_factor_authentication_type: TWO_FACTOR_AUTHENTICATION_TYPE;

  @ApiProperty({
    example: 5,
    description: 'maximum session count at once',
    type: Number,
    required: false,
  })
  max_concurrent_sessions: number;
}

export class CreateUserResponseDTO {
  @ApiProperty({ type: UserResDTO })
  data: UserResDTO;
}

//------------- filter user ----------------
export class FilterUserResponseDTO {
  @ApiProperty({ type: [UserResDTO] })
  data: UserResDTO[];
}

//------------- find by user id ----------------
export class FindUserResponseDTO {
  @ApiProperty({ type: UserResDTO })
  data: UserResDTO;
}

//------------- filter user meta data ----------------

class UserMetaResDTO {
  @ApiProperty({
    example: '66c6eae3ca7b182f8de59f52',
    description: 'User ID',
    type: String,
    required: true,
  })
  @IsObjectID()
  _id: string;

  @ApiProperty({
    example: '123',
    description: 'virtual extension',
    type: Number,
    required: true,
  })
  virtual_extension: number;

  @ApiProperty({
    example: true,
    description: 'User active status',
    type: Boolean,
    required: true,
  })
  is_active: boolean;

  @ApiProperty({
    example: 'Admin',
    description: 'First name of the user',
    type: String,
    required: true,
  })
  first_name: string;

  @ApiProperty({
    example: 'User',
    description: 'Last name of the user',
    type: String,
    required: true,
  })
  last_name: string;

  @ApiProperty({
    example: 'admin@example.com',
    description: 'Email address of the user',
    type: String,
    required: true,
  })
  email: string;

  @ApiProperty({
    example: 'admin',
    description: 'Username of the user',
    type: String,
    required: true,
  })
  username: string;

  @ApiProperty({
    example: [],
    description: 'Devices assigned to the user',
    type: [String],
    required: true,
  })
  devices: string[];

  @ApiProperty({
    example: { date: '2024-09-04', time: '11:55:47 - (GMT +05:30)' },
    description: 'Last login date and time',
    required: true,
  })
  last_login: { date: string; time: string };

  @ApiProperty({
    example: [{ role_id: '66c6eae2ca7b182f8de59f44', role_name: 'Admin' }],
    description: 'Roles assigned to the user',
    required: true,
  })
  roles: { role_id: string; role_name: string }[];

  @ApiProperty({
    example: [
      { desk_id: '66c9f29772c24e689d9a84c3', desk_name: 'technical desk' },
    ],
    description: 'Desks assigned to the user',
    required: true,
  })
  desks: { desk_id: string; desk_name: string }[];

  @ApiProperty({
    example: [
      {
        skill_group_id: '66cda0493abeea2136c55591',
        skill_group_name: 'english speaking skill group',
      },
    ],
    description: 'Skill groups assigned to the user',
    required: true,
  })
  skill_groups: { skill_group_id: string; skill_group_name: string }[];
}

export class UserMetaDataResponseDTO {
  @ApiProperty({ type: [UserMetaResDTO] })
  data: UserMetaResDTO[];
}

export class UpdateUserStatusResponseDTO {
  @ApiProperty({
    example: true,
    description: 'Indicates if the operation was successful',
  })
  success: boolean;

  @ApiProperty({
    example: USER_STATUS.AVAILABLE,
    enum: USER_STATUS,
    description: 'Updated user status',
  })
  status: USER_STATUS;
}
