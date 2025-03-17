import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AUTH_CONFIG_KEYS } from '@constant/authentication/auth';
import {
  IAuthCredentials,
  ILoginPayload,
  IUser,
} from '@interface/authorization/user';
import { DB_COLLECTION_NAMES } from '@constant/common/db-collection-names';
import { InjectModel } from '@nestjs/mongoose';
import { IAuthCredentialsModel } from '../schemas/auth-credential.schema';
import { Model, Types } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { IUserModel } from '@module/users/schemas/user.schema';
import { CommonDatabaseService } from '@common/services/common.database.service';
import { RESPONSE_MESSAGES } from '@constant/common/responses';

@Injectable()
export class AuthCommonService extends CommonDatabaseService<IAuthCredentials> {
  constructor(
    @InjectModel(DB_COLLECTION_NAMES.AUTH_CREDENTIALS)
    readonly authCredentialsModel: Model<IAuthCredentialsModel>,

    @InjectModel(DB_COLLECTION_NAMES.USERS)
    private readonly userModel: Model<IUserModel>,

    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {
    super(authCredentialsModel, DB_COLLECTION_NAMES.AUTH_CREDENTIALS);
  }

  // validate user credentials and expire token time and returns IAuthCredentials without password
  async validateUser(
    user_id: string,
    currentPassword: string,
  ): Promise<Omit<IAuthCredentials, 'password'> | null> {
    try {
      // Find user document by user_id
      const authCredentials = await this.findDocument({
        user_id: new Types.ObjectId(user_id),
      });

      if (!authCredentials) return null;

      // Check if credentials are expired before attempting password validation
      // if (
      //   authCredentials.expires_at &&
      //   authCredentials.expires_at <= Date.now()
      // )
      //   throw new UnauthorizedException('Credentials expired');

      // Validate password
      const isPasswordValid = await bcrypt.compare(
        currentPassword,
        authCredentials.password,
      );

      if (!isPasswordValid)
        throw new UnauthorizedException([
          RESPONSE_MESSAGES.INVALID_CREDENTIALS,
        ]);

      // Return user data without password if valid
      const { password, ...result } = authCredentials;
      return result;
    } catch (error) {
      new Logger().debug(
        `auth-common.service.ts -> validateUser -> ${error}`,
        'DEBUG',
      );
      throw new UnauthorizedException([RESPONSE_MESSAGES.INVALID_CREDENTIALS]);
    }
  }

  // generate tokens based on username, user_id, and permissions
  generateTokens(user: ILoginPayload) {
    const payload = {
      username: user.username,
      sub: user._id,
      permissions: user.permissions,
    };

    const access_token = this.jwtService.sign(payload, {
      secret: this.configService.get(AUTH_CONFIG_KEYS.JWT_SECRET),
      expiresIn: '10d',
    });

    const refresh_token = this.jwtService.sign(payload, {
      secret: this.configService.get(AUTH_CONFIG_KEYS.JWT_SECRET),
      expiresIn: '12d',
    });

    return { access_token, refresh_token };
  }

  generateResetToken(data: IUser) {
    const payload = {
      username: data.username,
      user_id: data._id,
      email: data.email,
    };

    const reset_token = this.jwtService.sign(payload, {
      secret: this.configService.get(AUTH_CONFIG_KEYS.JWT_SECRET),
      expiresIn: '1d',
    });

    return reset_token;
  }

  validateResetToken(token: string): Partial<IUser> | null {
    try {
      const payload = this.jwtService.verify(token, {
        secret: this.configService.get(AUTH_CONFIG_KEYS.JWT_SECRET),
      });

      return {
        username: payload.username,
        _id: payload.user_id,
        email: payload.email,
      } as Partial<IUser>;
    } catch (error) {
      new Logger().debug(
        `auth-common.service.ts -> validateResetToken -> ${error}`,
        'DEBUG',
      );
      throw new UnauthorizedException([RESPONSE_MESSAGES.INVALID_TOKEN]);
    }
  }

  async validateToken(token: string) {
    try {
      const payload = this.jwtService.verify(token);
      const user = (
        await this.userModel.findById(payload.sub)?.exec()
      )?.toObject();

      return user;
    } catch (error) {
      return null;
    }
  }

  /**
   * The function `verifyRefreshToken` verifies a JWT refresh token and returns the payload if the
   * verification is successful. It throws an error if the verification fails.
   */
  async verifyRefreshToken(token: string) {
    try {
      return this.jwtService.verify(token, {
        secret: this.configService.get(AUTH_CONFIG_KEYS.JWT_SECRET),
      });
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new UnauthorizedException('Refresh token expired');
      }

      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  /**
   * The `refresh` function in TypeScript asynchronously verifies a JWT token and returns a new access
   * token signed with the payload.
   */
  async refresh(token: string) {
    try {
      const payload = await this.verifyRefreshToken(token);

      const user = await this.findDocument({ user_id: payload.sub });
      if (!user) throw new UnauthorizedException('User not found');

      const loginPayload = {
        _id: user.user_id,
        username: payload.username,
        permissions: payload.permissions,
      };

      const tokens = this.generateTokens(loginPayload);
      return tokens;
    } catch (error) {
      new Logger().debug(`auth.service.ts -> refresh -> ${error}`, 'DEBUG');
      throw error;
    }
  }
}
