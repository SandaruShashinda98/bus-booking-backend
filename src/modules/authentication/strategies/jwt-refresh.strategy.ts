import { Strategy, ExtractJwt } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AUTH_CONFIG_KEYS } from '@constant/authentication/auth';
import { UsersDatabaseService } from '@module/users/services/user.database.service';
import { RESPONSE_MESSAGES } from '@constant/common/responses';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(
    private readonly configService: ConfigService,
    private readonly userDatabaseService: UsersDatabaseService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get(AUTH_CONFIG_KEYS.JWT_SECRET),
    });
  }

  /**
   * The function validates a user payload by fetching user information and role from a service and
   * returns the user data with role included.
   * @param {any} payload - The `payload` parameter in the `validate` function contains
   * information about the user or authentication credentials.
   * @returns The `validate` function is returning an object and can be accessed using the `@loggedUser` decorator.
   */
  async validate(payload: any) {
    const user = await this.userDatabaseService.findById(payload.sub);
    if (!user) {
      throw new UnauthorizedException([RESPONSE_MESSAGES.INVALID_CREDENTIALS]);
    }

    // This will be added to the request as request.user
    // Can access by @loggedUser decorator
    return { ...user, permissions: payload.permissions };
  }
}
