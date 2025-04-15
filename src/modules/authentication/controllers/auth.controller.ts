import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import {
  Controller,
  UseGuards,
  Post,
  Get,
  Body,
  NotFoundException,
  BadRequestException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { UsersDatabaseService } from '@module/users/services/user.database.service';
import { RESPONSE_MESSAGES } from '@constant/common/responses';
import {
  RequestForgotPasswordDTO,
  ResetPasswordDTO,
  UserLoginDTO,
} from '@dto/authentication/auth-request.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UserLoginResponseDTO } from '@dto/authentication/auth-response.dto';
import { LogRequest } from '@common/decorators/log-request-response.decorator';
import { RefreshTokenRequestDto } from '@dto/refresh-token/refresh-token-request.dto';
import { RefreshTokenResponseDto } from '@dto/refresh-token/refresh-token-response.dto';
import {
  IAuthCredentials,
  ILoggedUser,
  IUser,
} from '@interface/authorization/user';
import { AuthCommonService } from '../services/auth-common.service';
import { RESET_METHOD } from '@constant/authorization/user';
import { LoggedUser } from '@common/decorators/logged-user.decorator';
import * as bcrypt from 'bcrypt';
// import { EventsGateway } from 'src/websocket/websocket.gateway';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly authCommonService: AuthCommonService,
    private readonly usersDatabaseService: UsersDatabaseService,
  ) {}

  @ApiOperation({ summary: 'Login in to the system' })
  @ApiResponse({ type: UserLoginResponseDTO })
  @LogRequest('auth -> userLogin')
  @Post('login')
  async userLogin(@Body() body: UserLoginDTO) {
    if ((!body.email || !body.username) && !body.password)
      throw new BadRequestException([RESPONSE_MESSAGES.INVALID_CREDENTIALS]);

    let foundUser: IUser;

    // login by username
    if (body.username && !body.email)
      foundUser = await this.usersDatabaseService.findDocument({
        username: body.username,
        is_delete: false,
      });

    // login by email
    if (body.email && !body.username)
      foundUser = await this.usersDatabaseService.findDocument({
        email: body.email,
        is_delete: false,
      });

    if (!foundUser)
      throw new NotFoundException([RESPONSE_MESSAGES.INVALID_CREDENTIALS]);

    // validate password and get access_token, refresh_token, permissions
    const tokensAndPermissions =
      await this.authService.validatePasswordAndGetToken(foundUser, body);

    return {
      data: {
        ...tokensAndPermissions,
        ...foundUser,
        access_token_expires_in: 864000, //expires in 10 days
      },
    };
  }

  @ApiOperation({
    summary: 'Reset password by the user after creating the account',
  })
  @LogRequest('auth -> resetPassword')
  @Post('reset-password')
  async resetPassword(@Body() body: ResetPasswordDTO) {
    const foundUser = await this.usersDatabaseService.findDocument({
      email: body.email,
      is_delete: false,
    });

    if (!foundUser)
      throw new NotFoundException([RESPONSE_MESSAGES.DATA_NOT_FOUND]);

    let resetPassword: IAuthCredentials;

    if (body.resetMethod === RESET_METHOD.RESET_PASSWORD)
      resetPassword = await this.authService.resetPassword(body, foundUser);

    if (body.resetMethod === RESET_METHOD.FORGOT_PASSWORD)
      resetPassword = await this.authService.forgotPassword(foundUser, body);

    if (!resetPassword)
      throw new NotFoundException([RESPONSE_MESSAGES.INVALID_CREDENTIALS]);

    return {
      data: resetPassword,
    };
  }

  @ApiOperation({
    summary: 'Request forgot password email with reset token by user',
  })
  @LogRequest('auth -> forgotPassword')
  @Post('request-forgot-password')
  async requestForgotPassword(@Body() body: RequestForgotPasswordDTO) {
    const foundUser = await this.usersDatabaseService.findDocument({
      email: body.email,
      is_delete: false,
    });

    if (!foundUser)
      throw new NotFoundException([RESPONSE_MESSAGES.EMAIL_NOT_FOUND]);

    const requestForgotPassword =
      await this.authService.requestForgotPassword(foundUser);

    return {
      data: requestForgotPassword,
    };
  }

  @LogRequest('auth -> refresh')
  @Post('refresh')
  async refresh(
    @Body() body: RefreshTokenRequestDto,
  ): Promise<RefreshTokenResponseDto> {
    const { refresh_token } = body;

    if (!refresh_token) throw new BadRequestException();

    const token = await this.authCommonService.refresh(refresh_token);

    return {
      access_token: token.access_token,
      refresh_token: token.refresh_token,
      access_token_expires_in: 864000, //expires in 10 days
    };
  }

  @Post('register')
  async register(@Body() body: any) {
    const foundUser = await this.usersDatabaseService.findDocument({
      email: body.email,
    });

    if (!foundUser)
      throw new NotFoundException([RESPONSE_MESSAGES.DATA_NOT_FOUND]);

    const foundCredentials = await this.authService.findAuthCredentials(
      foundUser._id,
    );

    if (!foundCredentials)
      throw new NotFoundException([RESPONSE_MESSAGES.DATA_NOT_FOUND]);

    const hashedPassword = await bcrypt.hash(body.password, 10);

    await this.authService.updateAuthCredential(foundCredentials._id, {
      ...foundCredentials,
      password: hashedPassword,
    });
  }

  @UseGuards(JwtAuthGuard)
  @LogRequest('auth -> getProfile')
  @Get('profile')
  async getProfile(@LoggedUser() loggedUser: ILoggedUser) {
    const foundUser = await this.usersDatabaseService.findDocument({
      _id: loggedUser._id,
    });
    if (!foundUser)
      throw new NotFoundException([RESPONSE_MESSAGES.DATA_NOT_FOUND]);
    return {
      data: foundUser,
    };
  }
}
