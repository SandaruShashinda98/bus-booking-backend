import {
  Controller,
  Body,
  UseGuards,
  UnprocessableEntityException,
  Get,
  Query,
  Param,
  NotFoundException,
  Patch,
  Post,
} from '@nestjs/common';
import { RESPONSE_MESSAGES } from '@constant/common/responses';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { UsersDatabaseService } from '../services/user.database.service';
import { CreateUserDTO } from '@dto/authorization/user-request.dto';
import {
  CreateUserResponseDTO,
  FilterUserResponseDTO,
  FindUserResponseDTO,
  UserMetaDataResponseDTO,
} from '@dto/authorization/user-response.dto';
import {
  DataToCheckDto,
  FilterUsersDto,
  FilterUsersMetaDataDto,
} from '@dto/authorization/user-query-param.dto';
import { UsersService } from '../services/user.service';
import { ObjectIDPathDTO } from '@common/dto/object-id.path.dto';
import { ILoggedUser, IUser } from '@interface/authorization/user';
import { LoggedUser } from '@common/decorators/logged-user.decorator';
import { PermissionGuard } from '@common/guards/permission.guard';
import { Permissions } from '@common/decorators/permissions.decorator';
import { PERMISSIONS } from '@constant/authorization/roles';
import { LogRequest } from '@common/decorators/log-request-response.decorator';
import { VERSION_NUMBER } from '@constant/common/release-info';
import { UserCreateService } from '../services/user-creation.service';
@ApiTags('users')
@Controller({ path: 'users' })
export class UserController {
  constructor(
    private readonly usersDatabaseService: UsersDatabaseService,
    private readonly usersService: UsersService,
    private readonly userCreateService: UserCreateService,
  ) {}

  @ApiOperation({ summary: 'Get all users with filters and pagination' })
  @ApiResponse({ type: FilterUserResponseDTO })
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Permissions(PERMISSIONS.ADMIN, PERMISSIONS.SUPPORT, PERMISSIONS.AGENT)
  @Get()
  async filterUsers(@Query() queryParams: FilterUsersDto) {
    const filters = this.usersService.getUserFilters(queryParams);

    const foundUsers =
      await this.usersDatabaseService.filterDocumentsWithPagination(
        filters,
        queryParams.start || 0,
        queryParams.size || 0,
      );

    return foundUsers;
  }

  @ApiOperation({ summary: 'Get all users for search' })
  @ApiResponse({ type: FilterUserResponseDTO })
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Permissions(PERMISSIONS.ADMIN, PERMISSIONS.SUPPORT, PERMISSIONS.AGENT)
  @Get('search')
  async getUsersForSearch(@Query() queryParams: FilterUsersDto) {
    const filters = this.usersService.getUserFilters(queryParams);

    const foundUsers = await this.usersDatabaseService.filterSearchData(
      filters,
      queryParams.start || 0,
      queryParams.size || 0,
      '$username',
    );
    return foundUsers;
  }

  @ApiOperation({ summary: 'Get user by object id' })
  @ApiResponse({ type: FindUserResponseDTO })
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Permissions(PERMISSIONS.ADMIN, PERMISSIONS.SUPPORT, PERMISSIONS.AGENT)
  @Get(':id')
  async getUserByID(@Param() pathParams: ObjectIDPathDTO) {
    const foundUser = await this.usersDatabaseService.getSingleUserWithMetaData(
      pathParams.id,
    );

    if (!foundUser)
      throw new NotFoundException([RESPONSE_MESSAGES.DATA_NOT_FOUND]);

    return { data: foundUser };
  }

  @ApiOperation({ summary: 'Get user by object id' })
  @ApiResponse({ type: FindUserResponseDTO })
  @UseGuards(JwtAuthGuard, PermissionGuard)
  // @Permissions(PERMISSIONS.ADMIN, PERMISSIONS.SUPPORT)
  @Get('name/:id')
  async getUserFullNameByID(@Param() pathParams: ObjectIDPathDTO) {
    const foundUser = await this.usersDatabaseService.findById(pathParams.id);

    if (!foundUser)
      throw new NotFoundException([RESPONSE_MESSAGES.DATA_NOT_FOUND]);

    return {
      data: {
        first_name: foundUser.first_name?.trim() ?? '',
        last_name: foundUser.last_name?.trim() ?? '',
      },
    };
  }

  @ApiOperation({ summary: 'Get all users with filters and pagination' })
  @ApiResponse({ type: UserMetaDataResponseDTO })
  @UseGuards(JwtAuthGuard, PermissionGuard)
  // @Permissions(PERMISSIONS.ADMIN, PERMISSIONS.SUPPORT)
  @LogRequest(`users -> filterUsersWithMetaData -> ${VERSION_NUMBER}`)
  @Post('meta-data')
  async filterUsersWithMetaData(@Body() filterBody: FilterUsersMetaDataDto) {
    const filters = this.usersService.getMetaFilters(filterBody);

    const foundUsers = await this.usersDatabaseService.filterUsersWithMetaData(
      filters,
      Number(filterBody.start) || 0,
      Number(filterBody.size) || 0,
    );

    return foundUsers;
  }

  @ApiOperation({ summary: 'Check username or email exists' })
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Permissions(PERMISSIONS.ADMIN, PERMISSIONS.SUPPORT, PERMISSIONS.AGENT)
  @Post('check-data-existence')
  async checkDataExistence(@Body() dataToCheck: DataToCheckDto) {
    const searchFilter =
      this.usersService.createFindExistingUserFilter(dataToCheck);
    const foundUser = await this.usersDatabaseService.findUserExistence(
      searchFilter,
      dataToCheck._id,
    );

    return foundUser;
  }

  @ApiOperation({ summary: 'Get names for a given user id array' })
  @ApiResponse({ type: UserMetaDataResponseDTO })
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Permissions(PERMISSIONS.ADMIN, PERMISSIONS.SUPPORT, PERMISSIONS.AGENT)
  @Post('names')
  async getUsersNamesByIds(@Body() body: { userIds: string[] }) {
    const foundUsers =
      await this.usersDatabaseService.getUserIdsAndReturnsNames(body.userIds);

    return { data: foundUsers };
  }

  @ApiOperation({
    summary: 'Create new user with auth credentials / update user',
  })
  @ApiResponse({ type: CreateUserResponseDTO })
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Permissions(PERMISSIONS.ADMIN, PERMISSIONS.SUPPORT, PERMISSIONS.AGENT)
  @LogRequest('users -> createUser')
  @Patch()
  async createUser(
    @Body() createUserDto: any,
    @LoggedUser() loggedUser: ILoggedUser,
  ) {
    const userData = await this.userCreateService.createOrUpdateUser(
      createUserDto,
      loggedUser,
    );

    if (!userData)
      throw new UnprocessableEntityException([RESPONSE_MESSAGES.DB_FAILURE]);

    return { data: userData };
  }

  @ApiOperation({ summary: 'Update new user' })
  @ApiResponse({ type: CreateUserResponseDTO })
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Permissions(PERMISSIONS.ADMIN, PERMISSIONS.SUPPORT, PERMISSIONS.AGENT)
  @LogRequest('users -> updateUser')
  @Patch(':id')
  async updateUser(
    @Body() updateUserDto: any,
    @Param() pathParams: ObjectIDPathDTO,
    @LoggedUser() loggedUser: ILoggedUser,
  ) {
    const foundUser = await this.usersDatabaseService.findById(pathParams.id);

    if (!foundUser)
      throw new NotFoundException([RESPONSE_MESSAGES.DATA_NOT_FOUND]);

    //TODO: this is for temporary(dev) purpose, remove it later
    // if (foundUser.username === 'admin')
    //   throw new UnprocessableEntityException([
    //     RESPONSE_MESSAGES.FORBIDDEN_RESOURCE,
    //   ]);

    (updateUserDto as unknown as Partial<IUser>).changed_by = loggedUser._id;

    const updatedUser = await this.usersDatabaseService.updateUser(
      foundUser._id.toString(),
      updateUserDto as unknown as Partial<IUser>,
    );

    if (!updatedUser)
      throw new UnprocessableEntityException([RESPONSE_MESSAGES.DB_FAILURE]);

    return { data: updatedUser };
  }

  @ApiOperation({ summary: 'Get users of a predefined roles' })
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Permissions(PERMISSIONS.ADMIN, PERMISSIONS.SUPPORT, PERMISSIONS.AGENT)
  @Get('users-with-role/:name')
  async getUsersWithRole(@Param('name') name: string) {
    const usersWithRoles =
      await this.usersDatabaseService.findUsersWithRoleName(name);

    return { data: usersWithRoles };
  }
}
