import { IsObjectID } from '@common/dto/object-id.path.dto';
import { ApiProperty } from '@nestjs/swagger';

class UserLoginResDTO {
  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'Access token for authentication',
    type: String,
    required: true,
  })
  access_token: string;

  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'Refresh token for authentication',
    type: String,
    required: true,
  })
  refresh_token: string;

  @ApiProperty({
    example: '66b46a063f876dec3a4523c3',
    description: 'ID of the user',
    type: String,
    required: true,
  })
  @IsObjectID()
  _id: string;

  @ApiProperty({
    example: true,
    description: 'Indicates if the user is active',
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
    example: ['ADMIN'],
    description: 'Roles assigned to the user',
    type: [String],
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
    example: '2024-08-08T06:47:34.962Z',
    description: 'Date and time when the user was created',
    type: Date,
    required: true,
  })
  created_on: Date;

  @ApiProperty({
    example: '2024-08-08T06:47:34.962Z',
    description: 'Date and time when the user was last modified',
    type: Date,
    required: true,
  })
  last_modified_on: Date;
}

export class UserLoginResponseDTO {
  @ApiProperty({ type: UserLoginResDTO, required: true })
  data: UserLoginResDTO;
}
