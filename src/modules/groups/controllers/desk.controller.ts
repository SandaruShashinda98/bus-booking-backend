import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  UseGuards,
  Query,
  UnprocessableEntityException,
  NotFoundException,
} from '@nestjs/common';
import { ObjectIDPathDTO } from '@common/dto/object-id.path.dto';
import { RESPONSE_MESSAGES } from '@constant/common/responses';
import { CreateDeskDTO, EditDeskDTO } from '@dto/groups/desk-request.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { LoggedUser } from '@common/decorators/logged-user.decorator';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { ILoggedUser } from '@interface/authorization/user';
import { Types } from 'mongoose';
import { PermissionGuard } from '@common/guards/permission.guard';
import { PERMISSIONS } from '@constant/authorization/roles';
import { Permissions } from '@common/decorators/permissions.decorator';
import { CommonSearchResponseDTO } from '@common/dto/common-fields.dto';
import { LogRequest } from '@common/decorators/log-request-response.decorator';
import { DuplicateException } from '@common/filters/duplicate-exception.filter';
import { GroupService } from '../services/group.service';
import { DesksDatabaseService } from '../services/desk.database.service';
import {
  CreateDeskResponseDTO,
  DeskUsersResponseDTO,
  FilterDesksResponseDTO,
} from '@dto/groups/desk-response.dto';
import { GetGroupQueryDTO } from '@dto/groups/group-query-params.dto';
import { UserGroupService } from '../services/user-group.service';
import { USER_GROUP_TYPE } from '@constant/groups/groups';

@ApiTags('desks')
@Controller({ path: 'desks' })
export class DeskController {
  constructor(
    private readonly groupService: GroupService,
    private readonly desksDatabaseService: DesksDatabaseService,
    private readonly userGroupService: UserGroupService,
  ) {}

  @ApiOperation({ summary: 'Get All Desks with filters and pagination' })
  @ApiResponse({ type: FilterDesksResponseDTO })
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Permissions(PERMISSIONS.ADMIN)
  @Get()
  async filterDesks(@Query() queryParams: GetGroupQueryDTO) {
    const filters = this.groupService.getDesksOrSkillGroupFilters(queryParams);

    const foundDesks =
      await this.desksDatabaseService.filterDocumentsWithPagination(
        filters,
        queryParams.start || 0,
        queryParams.size || 0,
      );

    return foundDesks;
  }

  @ApiOperation({
    summary: 'Get All Desks with filters and pagination - for search',
  })
  @ApiResponse({ type: CommonSearchResponseDTO })
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Permissions(PERMISSIONS.ADMIN)
  @Get('search')
  async filterSearchDesk(@Query() queryParams: GetGroupQueryDTO) {
    const filters = this.groupService.getDesksOrSkillGroupFilters(queryParams);

    const foundDesks = await this.desksDatabaseService.filterSearchData(
      filters,
      queryParams.start || 0,
      queryParams.size || 0,
      '$name',
    );

    return foundDesks;
  }

  @ApiOperation({
    summary: 'Get single desk and get users in a desk with pagination',
  })
  @ApiResponse({ type: DeskUsersResponseDTO })
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Permissions(PERMISSIONS.ADMIN)
  @Get(':id')
  async getSingleDeskUsers(
    @Param() pathParams: ObjectIDPathDTO,
    @Query() queryParams: GetGroupQueryDTO,
  ) {
    const foundUsers = await this.desksDatabaseService.filterSingleDeskUsers(
      queryParams.searchKey || '', // user's name
      new Types.ObjectId(pathParams.id), // desk id
      queryParams.start || 0, //user level start
      queryParams.size || 0, //user level size
    );

    return foundUsers;
  }

  @ApiOperation({ summary: 'Create new Desk with users' })
  @ApiResponse({ type: CreateDeskResponseDTO })
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Permissions(PERMISSIONS.ADMIN)
  @LogRequest('desks -> createDesk')
  @Post()
  async createDesk(
    @Body() createDeskDto: CreateDeskDTO,
    @LoggedUser() loggedUser: ILoggedUser,
  ) {
    const foundDesk = await this.desksDatabaseService.findDocument({
      name: createDeskDto.name,
      is_delete: false,
    });

    if (foundDesk)
      throw new DuplicateException([RESPONSE_MESSAGES.DUPLICATE_DESK]);

    // Create new desk
    const newDesk = await this.desksDatabaseService.createNewDesk(
      {
        name: createDeskDto.name,
      },
      loggedUser,
    );

    if (!newDesk)
      throw new UnprocessableEntityException(RESPONSE_MESSAGES.DB_FAILURE);

    //TODO: get auto add to desk users

    // create new desk users
    const users =
      createDeskDto.users?.length > 0
        ? createDeskDto.users?.map((i) => new Types.ObjectId(i))
        : [];

    await this.userGroupService.bulkCreateGroupUsers(
      users,
      newDesk._id,
      USER_GROUP_TYPE.DESK,
    );

    return { data: newDesk };
  }

  @ApiOperation({ summary: 'Get desks for a given id array' })
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Permissions(PERMISSIONS.ADMIN)
  @Post('desks')
  async getRolesByIds(@Body() body: { groupIds: string[] }) {
    if (!body?.groupIds || body?.groupIds?.length < 1) return { data: [] };

    const foundDesks =
      await this.desksDatabaseService.getGroupIdsAndReturnsNames(body.groupIds);

    return { data: foundDesks };
  }

  @ApiOperation({ summary: 'Get count of users in a desk' })
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Permissions(PERMISSIONS.ADMIN)
  @Post('desk-user-count')
  async getUserCountOfDesk(@Body() body: { groupIds: string[] }) {
    if (!body?.groupIds || body?.groupIds?.length < 1) return { data: [] };

    const foundDesks = await this.userGroupService.countUsersByGroupIds(
      body.groupIds,
    );

    return { data: foundDesks };
  }

  @ApiOperation({ summary: 'Update Desk data with add or remove users' })
  @ApiResponse({ type: CreateDeskResponseDTO })
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Permissions(PERMISSIONS.ADMIN)
  @UseGuards(JwtAuthGuard)
  @LogRequest('desks -> updateDeskUser')
  @Patch(':id')
  async updateDeskUser(
    @LoggedUser() loggedUser: ILoggedUser,
    @Param() pathParams: ObjectIDPathDTO,
    @Body() updateDeskDto: EditDeskDTO,
  ) {
    const foundDesk = await this.desksDatabaseService.findById(pathParams.id);

    if (!foundDesk) throw new NotFoundException([RESPONSE_MESSAGES.DB_FAILURE]);

    const updateData = {
      ...foundDesk,
      name: updateDeskDto.name ?? foundDesk.name,
      changed_by: loggedUser._id,
      is_delete: updateDeskDto.is_delete ?? foundDesk.is_delete,
      last_modified_on: new Date(),
    };

    const updatedDesk = await this.desksDatabaseService.findDeskByIdAndUpdate(
      foundDesk._id,
      updateData,
    );

    await this.userGroupService.filterAndChangeUserGroup(
      updateDeskDto.users,
      foundDesk._id,
      USER_GROUP_TYPE.DESK,
      updateDeskDto.is_delete,
    );

    return { data: updatedDesk };
  }
}
