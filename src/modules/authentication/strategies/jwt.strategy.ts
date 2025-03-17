import { Strategy, ExtractJwt } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AUTH_CONFIG_KEYS } from '@constant/authentication/auth';
import { UsersDatabaseService } from '@module/users/services/user.database.service';
import { RESPONSE_MESSAGES } from '@constant/common/responses';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly userService: UsersDatabaseService,
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
   * @param {any} payload - The `payload` parameter in the `validate` function likely contains
   * information about the user or authentication credentials. In this code snippet, it seems to be used
   * to find a user and their role based on the `sub` property within the payload. The function
   * retrieves the user and their role from the `
   * @returns The `validate` function is returning an object that includes the user information fetched
   * from the `userService` along with the role obtained from the user's authentication credentials. The
   * object returned includes the user details spread using the spread operator (`...user, permissions`)
   */
  async validate(payload: any) {
    const user = await this.userService.findById(payload.sub);

    if (!user) {
      throw new UnauthorizedException([RESPONSE_MESSAGES.INVALID_CREDENTIALS]);
    }

    // This will be added to the request as request.user
    // Can access by @loggedUser decorator
    return { ...user, permissions: payload.permissions };
  }
}
