import { CreateUserDTO } from '@dto/authorization/user-request.dto';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { isValidObjectId } from 'mongoose';
import { UsersDatabaseService } from './user.database.service';
import { RESPONSE_MESSAGES } from '@constant/common/responses';
import { ILoggedUser, IUser } from '@interface/authorization/user';
import { RolesService } from '@module/roles/services/roles.service';
import { DuplicateException } from '@common/filters/duplicate-exception.filter';
import { EmailService } from '@common/services/email.service';
import { AuthCommonService } from '@module/authentication/services/auth-common.service';
import { RESET_METHOD } from '@constant/authorization/user';

@Injectable()
export class UserCreateService {
  constructor(
    private readonly usersDatabaseService: UsersDatabaseService,
    private readonly rolesService: RolesService,
    private readonly emailService: EmailService,
    private readonly authCommonService: AuthCommonService,
  ) {}

  generateRandomPassword() {
    const characters =
      '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz!@#$';
    const maxLength = 8;
    const charLength = characters.length;

    let password = '';
    for (let i = 0; i < maxLength; i++) {
      const randomIndex = Math.floor(Math.random() * charLength);
      password += characters[randomIndex];
    }

    return password;
  }

  /**
   * The function `createOrUpdateUser` is responsible for creating or updating a user based on the
   * provided `CreateUserDTO` object and the `ILoggedUser` object.
   */
  async createOrUpdateUser(
    createUserDto: CreateUserDTO,
    loggedUser: ILoggedUser,
  ) {
    // for new user - create user
    if (!createUserDto._id || !isValidObjectId(createUserDto._id)) {
      return await this.createUser(createUserDto, loggedUser);
    }
    // for existing user - update user
    else {
      return await this.editUser(createUserDto, loggedUser);
    }
  }

  async createUser(createUserDto: CreateUserDTO, loggedUser: ILoggedUser) {
    // remove _id if it is not a valid object id
    delete createUserDto._id;

    const { password, ...userData } = createUserDto;

    // validate roles requirement
    if (userData.role?.length === 0)
      throw new BadRequestException([RESPONSE_MESSAGES.EMPTY_ROLE]);

    // check username availability
    const foundUsername = await this.usersDatabaseService.findDocument({
      username: userData.username.trim(),
    });
    if (foundUsername)
      throw new DuplicateException([RESPONSE_MESSAGES.USERNAME_TAKEN]);

    // check email availability
    const foundEmail = await this.usersDatabaseService.findDocument({
      email: userData.email.trim(),
    });
    if (foundEmail)
      throw new DuplicateException([RESPONSE_MESSAGES.EMAIL_TAKEN]);

    // set created by
    (userData as unknown as Partial<IUser>).created_by = loggedUser._id;

    // validate roles and set roles
    (userData as unknown as Partial<IUser>).role =
      await this.rolesService.rolesValidationHandler(userData.role);

    // create random generated password
    // const generatedPassword = this.generateRandomPassword();

    // create new user
    const newUser = await this.usersDatabaseService.createUser(
      userData as unknown as Partial<IUser>,
      password,
    );

    if (!newUser)
      throw new UnprocessableEntityException([RESPONSE_MESSAGES.DB_FAILURE]);

    // send onboarding reset password email
    // const resetToken = this.authCommonService.generateResetToken(newUser);
    // const mailSucceed = await this.emailService.sendOnboardingEmail(
    //   userData.email.trim(),
    //   generatedPassword,
    //   resetToken,
    //   RESET_METHOD.RESET_PASSWORD,
    // );

    // if (!mailSucceed)
    //   throw new UnprocessableEntityException([
    //     RESPONSE_MESSAGES.EMAIL_SEND_FAIL,
    //   ]);

    return newUser;
  }

  async editUser(createUserDto: CreateUserDTO, loggedUser: ILoggedUser) {
    const foundUser = await this.usersDatabaseService.findById(
      createUserDto._id,
    );

    if (!foundUser)
      throw new NotFoundException([RESPONSE_MESSAGES.DATA_NOT_FOUND]);

    // TODO: remove this later
    if (foundUser.username === 'admin')
      throw new UnprocessableEntityException([
        RESPONSE_MESSAGES.FORBIDDEN_RESOURCE,
      ]);

    // Build validation queries in a single object
    const validationChecks: { email?: string; username?: string } = {};

    if (createUserDto.email !== foundUser.email)
      validationChecks.email = createUserDto.email;

    if (createUserDto.username !== foundUser.username)
      validationChecks.username = createUserDto.username;

    // Run validation if needed
    if (Object.keys(validationChecks).length > 0) {
      const query = {
        $or: [] as any[],
        _id: { $ne: foundUser._id },
      };

      if (validationChecks.email)
        query.$or.push({ email: validationChecks.email });

      if (validationChecks.username)
        query.$or.push({ username: validationChecks.username });

      const existingUser = await this.usersDatabaseService.findDocument(query);

      if (existingUser) {
        if (existingUser.email === validationChecks.email)
          throw new DuplicateException([RESPONSE_MESSAGES.EMAIL_TAKEN]);
        else throw new DuplicateException([RESPONSE_MESSAGES.USERNAME_TAKEN]);
      }
    }

    // Update user data
    const updatedUserData: IUser = {
      ...foundUser,
      ...(createUserDto as unknown as Partial<IUser>),
      changed_by: loggedUser._id,
      last_modified_on: new Date(),
    };

    const updatedUser = await this.usersDatabaseService.updateUser(
      foundUser._id.toString(),
      updatedUserData,
    );

    if (!updatedUser)
      throw new UnprocessableEntityException([RESPONSE_MESSAGES.DB_FAILURE]);

    return updatedUser;
  }
}
