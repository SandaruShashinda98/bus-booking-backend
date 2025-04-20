import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
  UnprocessableEntityException,
} from '@nestjs/common';
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
import { isValidPassword } from '@common/helpers/validation.helper';
import { RESPONSE_MESSAGES } from '@constant/common/responses';
import {
  ResetPasswordDTO,
  UserLoginDTO,
} from '@dto/authentication/auth-request.dto';
import { RolesDatabaseService } from '@module/roles/services/roles.database.service';
import { PERMISSIONS } from '@constant/authorization/roles';
import { AuthCommonService } from './auth-common.service';
import { EmailService } from '@common/services/email.service';
import { RESET_METHOD } from '@constant/authorization/user';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(DB_COLLECTION_NAMES.AUTH_CREDENTIALS)
    private readonly authCredentialsModel: Model<IAuthCredentialsModel>,

    private readonly rolesDatabaseService: RolesDatabaseService,
    private readonly authCommonService: AuthCommonService,
    private readonly emailService: EmailService,
  ) {}

  /**
   * The function creates an authentication credential for a user with the provided hashed password and
   * saves it to the database.
   */
  async createAuthCredential(
    savedUser: IUser,
    hashedPassword: string,
  ): Promise<IAuthCredentials | null> {
    const resetToken = this.authCommonService.generateResetToken(savedUser);
    const futureDate = new Date(Date.now() + 24 * 60 * 60 * 1000); // date now + 24 hrs

    try {
      const authCredentials = new this.authCredentialsModel({
        user_id: savedUser._id,
        token: '',
        refresh_token: '',
        password: hashedPassword,
        created_by: savedUser.created_by,
        reset_token: resetToken,
        expires_at: futureDate,
      });
      await authCredentials.save();
      return authCredentials;
    } catch (err) {
      new Logger().debug(
        `auth.service.ts -> createAuthCredential -> ${err}`,
        'DEBUG',
      );
      return null;
    }
  }

  async updateAuthCredential(
    id: Types.ObjectId,
    data: Partial<IAuthCredentials>,
  ): Promise<IAuthCredentials | null> {
    try {
      const authCredentialUpdate =
        await this.authCredentialsModel.findByIdAndUpdate(id, {
          ...data,
          last_modified_on: new Date(),
        });

      return authCredentialUpdate;
    } catch (err) {
      new Logger().debug(
        `auth.service.ts -> updateAuthCredential -> ${err}`,
        'DEBUG',
      );
      return null;
    }
  }

  // steps:
  // find user data based on email or username - in controller
  // find auth credential based on user id - validateUser func
  // check expire time - validateUser func
  // find permissions
  // generate tokens based on user data
  // update new auth credential with tokens
  // update user data with last login - in controller
  async validatePasswordAndGetToken(foundUser: IUser, body: UserLoginDTO) {
    const foundAuthCredentials = await this.authCommonService.validateUser(
      foundUser._id.toString(),
      body.password,
    );

    if (!foundAuthCredentials)
      throw new NotFoundException([RESPONSE_MESSAGES.INVALID_CREDENTIALS]);

    // find permission list
    const permissions: PERMISSIONS[] =
      await this.rolesDatabaseService.getUniquePermissionList(foundUser.role);

    const payload: ILoginPayload = {
      _id: foundUser._id,
      username: foundUser.username,
      permissions: permissions,
    };

    try {
      const { access_token, refresh_token } =
        this.authCommonService.generateTokens(payload);

      if (!access_token || !refresh_token) {
        new Logger().debug(
          `auth.service.ts -> validatePasswordAndGetToken -> no tokens found`,
          'DEBUG',
        );
        throw new UnprocessableEntityException([
          RESPONSE_MESSAGES.DATA_NOT_FOUND,
        ]);
      }

      await this.authCredentialsModel.findOneAndUpdate(
        { user_id: foundUser._id },
        {
          $set: { token: access_token, refresh_token: refresh_token },
        },
      );

      return { access_token, refresh_token, permissions };
    } catch (error) {
      new Logger().debug(
        `auth.service.ts -> validatePasswordAndGetToken -> ${error}`,
        'DEBUG',
      );
      throw new UnprocessableEntityException([
        RESPONSE_MESSAGES.DATA_NOT_FOUND,
      ]);
    }
  }

  // steps:
  // find user data based on email
  // find auth credential based on user id - validateUser func
  // check expire time - validateUser func
  // check current password in the system and check wether that is matching with given password
  // check the tokens existing token and the given token is matching
  // update new auth credential with new password and token
  async resetPassword(
    body: ResetPasswordDTO,
    foundUser: IUser,
  ): Promise<IAuthCredentials | null> {
    try {
      // Check new password is valid under policy
      if (!isValidPassword(body.newPassword))
        throw new BadRequestException([RESPONSE_MESSAGES.INVALID_PASSWORD]);

      // Validate user auth credentials
      const validatedAuthCredential = await this.authCommonService.validateUser(
        foundUser._id.toString(),
        body.password,
      );
      if (!validatedAuthCredential)
        throw new NotFoundException(RESPONSE_MESSAGES.INVALID_PASSWORD);

      // Verify reset token
      const isMatch = this.authCommonService.validateResetToken(body.token);
      if (!isMatch)
        throw new UnauthorizedException([RESPONSE_MESSAGES.INVALID_TOKEN]);

      // Hash the new password
      const hashedPassword = await bcrypt.hash(body.newPassword, 10);

      // Update the password in AuthCredentialModel
      const authCredentialUpdate = await this.updateAuthCredential(
        validatedAuthCredential._id,
        {
          ...validatedAuthCredential,
          password: hashedPassword,
          expires_at: null,
          changed_by: foundUser._id,
        },
      );

      if (!authCredentialUpdate)
        throw new NotFoundException([RESPONSE_MESSAGES.DATA_NOT_FOUND]);

      return authCredentialUpdate;
    } catch (error) {
      new Logger().debug(
        `auth.service.ts -> resetPassword -> ${error}`,
        'DEBUG',
      );
      throw new NotFoundException([RESPONSE_MESSAGES.INVALID_CREDENTIALS]);
    }
  }

  // steps:
  // find user data based on email
  // find auth credential based on user id
  // check the reset-tokens, existing token and the given token is matching
  // update new auth credential with new password and token
  async forgotPassword(foundUser: IUser, body: ResetPasswordDTO) {
    // Check new password is valid under policy
    if (!isValidPassword(body.newPassword))
      throw new BadRequestException([RESPONSE_MESSAGES.INVALID_PASSWORD]);

    // Found auth credentials
    const foundAuthCredentials = await this.authCommonService.findDocument({
      user_id: foundUser._id,
    });

    // Verify reset token
    const isMatch = this.authCommonService.validateResetToken(body.token);
    if (!isMatch)
      throw new UnauthorizedException([RESPONSE_MESSAGES.INVALID_TOKEN]);

    // Hash the new password
    const hashedPassword = await bcrypt.hash(body.newPassword, 10);

    // Update the password in AuthCredentialModel
    const authCredentialUpdate = await this.updateAuthCredential(
      foundAuthCredentials._id,
      {
        ...foundAuthCredentials,
        password: hashedPassword,
        expires_at: null,
        changed_by: foundUser._id,
      },
    );

    if (!authCredentialUpdate)
      throw new UnauthorizedException([RESPONSE_MESSAGES.DB_FAILURE]);

    return authCredentialUpdate;
  }

  async requestForgotPassword(foundUser: IUser) {
    // Found auth credentials
    const foundAuthCredentials = await this.authCommonService.findDocument({
      user_id: foundUser._id,
    });

    if (!foundAuthCredentials)
      throw new UnprocessableEntityException([
        RESPONSE_MESSAGES.DATA_NOT_FOUND,
      ]);

    const resetToken = this.authCommonService.generateResetToken(foundUser);
    const futureDate = new Date(Date.now() + 24 * 60 * 60 * 1000); // date now + 24 hrs

    // set reset token
    const authCredentialUpdate = await this.updateAuthCredential(
      foundAuthCredentials._id,
      {
        ...foundAuthCredentials,
        expires_at: futureDate,
        reset_token: resetToken,
        changed_by: foundUser._id,
      },
    );

    if (!authCredentialUpdate)
      throw new UnprocessableEntityException([RESPONSE_MESSAGES.DB_FAILURE]);

    // try {
    //   // send email
    //   await this.emailService.sendResetPasswordEmail(
    //     foundUser.email,
    //     resetToken,
    //     RESET_METHOD.FORGOT_PASSWORD,
    //   );

    //   return authCredentialUpdate;
    // } catch (error) {
    //   new Logger().debug(
    //     `auth.service.ts -> requestForgotPassword -> ${error}`,
    //     'DEBUG',
    //   );
    //   throw new UnprocessableEntityException([RESPONSE_MESSAGES.DB_FAILURE]);
    // }
  }

  async findAuthCredentials(user_id: Types.ObjectId) {
    return (
      await this.authCredentialsModel.findOne({ user_id })?.exec()
    )?.toObject();
  }
}
