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
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { LoggedUser } from '@common/decorators/logged-user.decorator';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { ILoggedUser } from '@interface/authorization/user';
import { RESPONSE_MESSAGES } from '@constant/common/responses';
import { Types } from 'mongoose';
import {
  CreateSkillGroupDTO,
  EditSkillGroupDTO,
} from '@dto/groups/skill-group-request.dto';
import {
  CreateSkillGroupResponseDTO,
  FilterSkillGroupResponseDTO,
  SkillGroupUsersResponseDTO,
} from '@dto/groups/skill-group-response.dto';
import { PermissionGuard } from '@common/guards/permission.guard';
import { PERMISSIONS } from '@constant/authorization/roles';
import { Permissions } from '@common/decorators/permissions.decorator';
import { CommonSearchResponseDTO } from '@common/dto/common-fields.dto';
import { LogRequest } from '@common/decorators/log-request-response.decorator';
import { SkillGroupsDatabaseService } from '../services/skill-group.database.service';
import { GroupService } from '../services/group.service';
import { DuplicateException } from '@common/filters/duplicate-exception.filter';
import { GetGroupQueryDTO } from '@dto/groups/group-query-params.dto';
import { UserGroupService } from '../services/user-group.service';
import { USER_GROUP_TYPE } from '@constant/groups/groups';

@ApiTags('skill-groups')
@Controller({ path: 'skill-groups' })
export class SkillGroupController {
  constructor(
    private readonly skillGroupsDatabaseService: SkillGroupsDatabaseService,
    private readonly groupService: GroupService,
    private readonly userGroupService: UserGroupService,
  ) {}

  @ApiOperation({ summary: 'Get All Skill groups with filters and pagination' })
  @ApiResponse({ type: FilterSkillGroupResponseDTO })
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Permissions(PERMISSIONS.ADMIN)
  @Get()
  async filterSkillGroups(@Query() queryParams: GetGroupQueryDTO) {
    const filters = this.groupService.getDesksOrSkillGroupFilters(queryParams);

    const foundSkillGroups =
      await this.skillGroupsDatabaseService.filterDocumentsWithPagination(
        filters,
        queryParams.start || 0,
        queryParams.size || 0,
      );

    return foundSkillGroups;
  }

  @ApiOperation({
    summary: 'Get All skill groups with filters and pagination - for search',
  })
  @ApiResponse({ type: CommonSearchResponseDTO })
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Permissions(PERMISSIONS.ADMIN)
  @Get('search')
  async filterSearchSkillGroups(@Query() queryParams: GetGroupQueryDTO) {
    const filters = this.groupService.getDesksOrSkillGroupFilters(queryParams);

    const foundSkillGroups =
      await this.skillGroupsDatabaseService.filterSearchData(
        filters,
        queryParams.start || 0,
        queryParams.size || 0,
        '$name',
      );

    return foundSkillGroups;
  }

  @ApiOperation({
    summary: 'Get single skill group and get users in a desk with pagination',
  })
  @ApiResponse({ type: SkillGroupUsersResponseDTO })
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Permissions(PERMISSIONS.ADMIN)
  @Get(':id')
  async getSingleSkillGroupUsers(
    @Param() pathParams: ObjectIDPathDTO,
    @Query() queryParams: GetGroupQueryDTO,
  ) {
    const foundUsers =
      await this.skillGroupsDatabaseService.filterSingleSkillGroupUsers(
        queryParams.searchKey || '', // user's name
        new Types.ObjectId(pathParams.id), // skill group id
        queryParams.start || 0, //user level start
        queryParams.size || 0, //user level size
      );

    return foundUsers;
  }

  @ApiOperation({ summary: 'Create new skill group with users' })
  @ApiResponse({ type: CreateSkillGroupResponseDTO })
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Permissions(PERMISSIONS.ADMIN)
  @LogRequest('skill-groups -> createSkillGroup')
  @Post()
  async createSkillGroup(
    @Body() createSkillGroupDto: CreateSkillGroupDTO,
    @LoggedUser() loggedUser: ILoggedUser,
  ) {
    const foundDesk = await this.skillGroupsDatabaseService.findDocument({
      name: createSkillGroupDto.name,
      is_delete: false,
    });

    if (foundDesk)
      throw new DuplicateException([RESPONSE_MESSAGES.DUPLICATE_SKILL_GROUP]);

    // Create new skill group
    const newSkillGroup =
      await this.skillGroupsDatabaseService.createNewSkillGroup(
        {
          name: createSkillGroupDto.name,
          description: createSkillGroupDto.description,
        },
        loggedUser,
      );

    if (!newSkillGroup)
      throw new UnprocessableEntityException(RESPONSE_MESSAGES.DB_FAILURE);

    //TODO:get auto add to skill group users

    //  create new skill group users
    const users =
      createSkillGroupDto.users?.length > 0
        ? createSkillGroupDto.users?.map((i) => new Types.ObjectId(i))
        : [];

    await this.userGroupService.bulkCreateGroupUsers(
      users,
      newSkillGroup._id,
      USER_GROUP_TYPE.SKILL_GROUP,
    );

    return { data: newSkillGroup };
  }

  @ApiOperation({ summary: 'Get groups for a given id array' })
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Permissions(PERMISSIONS.ADMIN)
  @Post('skill-groups')
  async getRolesByIds(@Body() body: { groupIds: string[] }) {
    if (!body?.groupIds || body?.groupIds?.length < 1) return { data: [] };

    const foundSkillGroups =
      await this.skillGroupsDatabaseService.getGroupIdsAndReturnsNames(
        body.groupIds,
      );

    return { data: foundSkillGroups };
  }

  @ApiOperation({ summary: 'Get count of users in a skill group' })
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Permissions(PERMISSIONS.ADMIN)
  @Post('skill-group-user-count')
  async getUserCountOfSkillGroup(@Body() body: { groupIds: string[] }) {
    if (!body?.groupIds || body?.groupIds?.length < 1) return { data: [] };

    const foundSkillGroups = await this.userGroupService.countUsersByGroupIds(
      body.groupIds,
    );

    return { data: foundSkillGroups };
  }

  @ApiOperation({ summary: 'Update skill group data with add or remove users' })
  @ApiResponse({ type: CreateSkillGroupResponseDTO })
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Permissions(PERMISSIONS.ADMIN)
  @UseGuards(JwtAuthGuard)
  @LogRequest('skill-groups -> updateSkillGroup')
  @Patch(':id')
  async updateSkillGroup(
    @LoggedUser() loggedUser: ILoggedUser,
    @Param() pathParams: ObjectIDPathDTO,
    @Body() updateSkillGroupDto: EditSkillGroupDTO,
  ) {
    const foundSkillGroup = await this.skillGroupsDatabaseService.findById(
      pathParams.id,
    );

    if (!foundSkillGroup)
      throw new NotFoundException([RESPONSE_MESSAGES.DATA_NOT_FOUND]);

    const updateData = {
      ...foundSkillGroup,
      name: updateSkillGroupDto.name ?? foundSkillGroup.name,
      description:
        updateSkillGroupDto.description ?? foundSkillGroup.description,
      is_delete: updateSkillGroupDto.is_delete ?? foundSkillGroup.is_delete,
      changed_by: loggedUser._id,
      last_modified_on: new Date(),
    };

    const updatedSkillGroup =
      await this.skillGroupsDatabaseService.findSkillGroupByIdAndUpdate(
        foundSkillGroup._id,
        updateData,
      );

    await this.userGroupService.filterAndChangeUserGroup(
      updateSkillGroupDto.users,
      foundSkillGroup._id,
      USER_GROUP_TYPE.SKILL_GROUP,
      updateSkillGroupDto.is_delete,
    );

    return { data: updatedSkillGroup };
  }
}
