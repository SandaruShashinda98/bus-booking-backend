import { IsString } from 'class-validator';

export class RefreshTokenResponseDto {
  @IsString({ message: 'Access token must be a string' })
  access_token: string;

  @IsString({ message: 'Refresh token must be a string' })
  refresh_token: string;

  access_token_expires_in: number;
}
