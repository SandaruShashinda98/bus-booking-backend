import { RESET_METHOD } from '@constant/authorization/user';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsString,
  IsNotEmpty,
  IsEmail,
  IsOptional,
  ValidateIf,
} from 'class-validator';

export class UserLoginDTO {
  @ApiProperty({
    example: 'john.doe@example.com',
    type: String,
    required: false,
  })
  @IsString()
  @IsOptional()
  @ValidateIf((requestBody) => !requestBody.username)
  @Transform((subject) => subject?.value?.trim()?.toLowerCase())
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'johnDoe', type: String, required: true })
  @IsString()
  @IsOptional()
  @ValidateIf((requestBody) => !requestBody.email)
  @Transform((username) => username.value?.trim())
  username: string;

  @ApiProperty({ example: 'johnDoe@123', type: String, required: true })
  @IsString()
  @IsNotEmpty()
  @Transform((password) => password.value?.trim())
  password: string;
}
export class ResetPasswordDTO {
  @ApiProperty({
    example: '23nn3n2.213j123.3njk123',
    type: String,
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  @Transform((token) => token.value?.trim())
  token: string;

  @ApiProperty({
    example: 'john.doe@example.com',
    type: String,
    required: false,
  })
  @IsString()
  @IsNotEmpty()
  @Transform((subject) => subject?.value?.trim()?.toLowerCase())
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'johnDoe@123', type: String, required: true })
  @IsString()
  @IsOptional()
  @Transform((password) => password.value?.trim())
  password: string;

  @ApiProperty({ example: 'johnDoe@123', type: String, required: true })
  @IsString()
  @IsOptional()
  @Transform((password) => password.value?.trim())
  newPassword: string;

  @ApiProperty({
    example: RESET_METHOD.FORGOT_PASSWORD,
    type: String,
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  resetMethod: string;
}

export class RequestForgotPasswordDTO {
  @ApiProperty({
    example: 'john.doe@example.com',
    type: String,
    required: false,
  })
  @IsString()
  @IsNotEmpty()
  @Transform((subject) => subject?.value?.trim()?.toLowerCase())
  @IsEmail()
  email: string;
}
