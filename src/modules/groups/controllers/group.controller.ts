import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
  UnprocessableEntityException,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { GroupDatabaseService } from '../services/group.database.service';
import { GroupService } from '../services/group.service';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { PERMISSIONS } from '@constant/authorization/roles';
import { Permissions } from '@common/decorators/permissions.decorator';
import { CommonSearchResponseDTO } from '@common/dto/common-fields.dto';
import { LoggedUser } from '@common/decorators/logged-user.decorator';
import { RESPONSE_MESSAGES } from '@constant/common/responses';
import { LogRequest } from '@common/decorators/log-request-response.decorator';
import { ILoggedUser } from '@interface/authorization/user';
import { ObjectIDPathDTO } from '@common/dto/object-id.path.dto';
import { PermissionGuard } from '@common/guards/permission.guard';
import { DuplicateException } from '@common/filters/duplicate-exception.filter';
import {
  CreateGroupDTO,
  FilterGroupDTO,
  UpdateGroupDTO,
} from '@dto/groups/group-request.dto';
import { GetGroupQueryDTO } from '@dto/groups/group-query-params.dto';
import { IFilterGroup, IGroup } from '@interface/groups/groups';
import { UserGroupService } from '../services/user-group.service';
import { USER_GROUP_TYPE } from '@constant/groups/groups';

@ApiTags('groups')
@Controller({ path: 'groups' })
export class GroupController {
  constructor(
    private readonly groupService: GroupService,
    private readonly groupDatabaseService: GroupDatabaseService,
    private readonly userGroupService: UserGroupService,
  ) {}

  @ApiOperation({
    summary: 'Get all user groups and pagination',
  })
  @UseGuards(JwtAuthGuard)
  @Permissions(PERMISSIONS.ADMIN)
  @Get()
  async filterGroups(@Query() queryParams: GetGroupQueryDTO) {
    const filters = this.groupService.getGroupFilters(queryParams);

    const foundGroups =
      await this.groupDatabaseService.filterDocumentsWithPagination(
        filters,
        Number(queryParams.start) || 0,
        Number(queryParams.size) || 0,
      );

    return foundGroups;
  }

  @ApiOperation({
    summary: 'Get All Groups with filters and pagination - for search',
  })
  @ApiResponse({ type: CommonSearchResponseDTO })
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Permissions(PERMISSIONS.ADMIN)
  @Get('search')
  async filterSearchDesk(@Query() queryParams: GetGroupQueryDTO) {
    const filters = this.groupService.getGroupFilters(queryParams);

    const foundGroup = await this.groupDatabaseService.filterSearchData(
      filters,
      queryParams.start || 0,
      queryParams.size || 0,
      '$name',
    );

    return foundGroup;
  }

  @ApiOperation({
    summary: 'Get group by id',
  })
  @ApiResponse({ type: CommonSearchResponseDTO })
  @UseGuards(JwtAuthGuard)
  @Permissions(PERMISSIONS.ADMIN)
  @Get(':id')
  async getGroupById(@Param() pathParams: ObjectIDPathDTO) {
    const foundGroups = await this.groupDatabaseService.findById(pathParams.id);

    if (!foundGroups)
      throw new NotFoundException([RESPONSE_MESSAGES.DATA_NOT_FOUND]);

    return { data: foundGroups };
  }

  @ApiOperation({ summary: 'Create new group' })
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Permissions(PERMISSIONS.ADMIN)
  @LogRequest('group -> createGroup')
  @Post()
  async createGroup(
    @Body() createGroupDto: CreateGroupDTO,
    @LoggedUser() loggedUser: ILoggedUser,
  ) {
    const foundDesk = await this.groupDatabaseService.findDocument({
      name: createGroupDto.name,
      is_delete: false,
    });

    if (foundDesk)
      throw new DuplicateException([RESPONSE_MESSAGES.DUPLICATE_GROUP]);

    // Create new group
    const newGroup = await this.groupDatabaseService.createNewGroup(
      createGroupDto,
      loggedUser,
    );

    if (!newGroup)
      throw new UnprocessableEntityException(RESPONSE_MESSAGES.DB_FAILURE);

    return { data: newGroup };
  }

  @ApiOperation({ summary: 'Get groups for a given role id array' })
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Permissions(PERMISSIONS.ADMIN)
  @Post('groups')
  async getRolesByIds(@Body() body: { groupIds: string[] }) {
    if (!body?.groupIds || body?.groupIds?.length < 1) return { data: [] };

    const foundGroups =
      await this.groupDatabaseService.getGroupIdsAndReturnsNames(body.groupIds);

    return { data: foundGroups };
  }

  @ApiOperation({
    summary: 'Assign group to skill group',
  })
  @UseGuards(JwtAuthGuard)
  @Permissions(PERMISSIONS.ADMIN)
  @Post('assign-to-skill-group')
  async assignGroupToSkillGroup(
    @Body() queryParams: { group_id: string; skill_group_id: string },
  ) {
    const updateGroup =
      await this.groupDatabaseService.assignGroupToSkillGroup(queryParams);

    return updateGroup;
  }

  @ApiOperation({
    summary: 'Check group existence',
  })
  @UseGuards(JwtAuthGuard)
  @Permissions(PERMISSIONS.ADMIN)
  @Post('check-existence')
  async checkGroupExistence(@Body() queryParams: Pick<IGroup, 'name' | '_id'>) {
    const filters = this.groupService.getGroupCheckExistence(queryParams);

    const foundGroups = await this.groupDatabaseService.findDocument(filters);
    if (foundGroups) return [foundGroups];
    return [];
  }

  @ApiOperation({ summary: 'Update group data and set previous group' })
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Permissions(PERMISSIONS.ADMIN)
  @UseGuards(JwtAuthGuard)
  @LogRequest('groups -> updateAndSetToPreviousGroup')
  @Patch('set-previous/:id')
  async updateAndSetToPreviousGroup(
    @LoggedUser() loggedUser: ILoggedUser,
    @Param() pathParams: ObjectIDPathDTO,
    @Body() updateFilterGroupDto: FilterGroupDTO[],
  ) {
    const foundGroup = await this.groupDatabaseService.findById(pathParams.id);

    if (!foundGroup)
      throw new NotFoundException([RESPONSE_MESSAGES.DATA_NOT_FOUND]);

    let updateData: IGroup;

    if (foundGroup?.filter_groups) {
      updateData = {
        ...foundGroup,
        previous_filter_groups: foundGroup.filter_groups,
        filter_groups: updateFilterGroupDto,
        changed_by: loggedUser._id,
        last_modified_on: new Date(),
      };
    } else {
      updateData = foundGroup;
    }

    const updatedGroup = await this.groupDatabaseService.findGroupByIdAndUpdate(
      foundGroup._id,
      updateData,
    );

    return { data: updatedGroup };
  }

  @ApiOperation({ summary: 'Update group data and reset previous group' })
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Permissions(PERMISSIONS.ADMIN)
  @UseGuards(JwtAuthGuard)
  @LogRequest('groups -> ResetToPreviousGroup')
  @Patch('reset-previous/:id')
  async resetToPreviousGroup(
    @LoggedUser() loggedUser: ILoggedUser,
    @Param() pathParams: ObjectIDPathDTO,
  ) {
    const foundGroup = await this.groupDatabaseService.findById(pathParams.id);

    if (!foundGroup)
      throw new NotFoundException([RESPONSE_MESSAGES.DATA_NOT_FOUND]);

    let updateData: IGroup;

    if (foundGroup?.filter_groups && foundGroup?.previous_filter_groups) {
      updateData = {
        ...foundGroup,
        filter_groups: foundGroup.previous_filter_groups,
        changed_by: loggedUser._id,
        last_modified_on: new Date(),
      };

      delete updateData.previous_filter_groups;
    } else {
      updateData = foundGroup;
    }

    const updatedGroup = await this.groupDatabaseService.findGroupByIdAndUpdate(
      foundGroup._id,
      updateData,
    );

    return { data: updatedGroup };
  }

  @ApiOperation({ summary: 'Update group data' })
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Permissions(PERMISSIONS.ADMIN)
  @UseGuards(JwtAuthGuard)
  @LogRequest('groups -> updateGroup')
  @Patch(':id')
  async updateGroup(
    @LoggedUser() loggedUser: ILoggedUser,
    @Param() pathParams: ObjectIDPathDTO,
    @Body() updateGroupDto: UpdateGroupDTO,
  ) {
    const foundGroup = await this.groupDatabaseService.findById(pathParams.id);

    if (!foundGroup)
      throw new NotFoundException([RESPONSE_MESSAGES.DATA_NOT_FOUND]);

    if (updateGroupDto.name) {
      const foundGroupByName = await this.groupDatabaseService.findDocument({
        name: updateGroupDto.name,
      });

      if (
        foundGroupByName &&
        foundGroupByName?._id?.toString() !== foundGroup?._id?.toString()
      )
        throw new DuplicateException([RESPONSE_MESSAGES.DUPLICATE_GROUP]);
    }

    const updateData = {
      ...foundGroup,
      ...updateGroupDto,
      is_delete: updateGroupDto.is_delete ?? foundGroup.is_delete,
      is_active: updateGroupDto.is_active ?? foundGroup.is_active,
      changed_by: loggedUser._id,
      last_modified_on: new Date(),
    };

    const nonEmptyTitles = updateData.filter_groups
      .map((group: IFilterGroup) => group?.filter_group_title)
      .filter((title) => title && title.trim() !== '');

    const hasDuplicates =
      nonEmptyTitles?.length !== new Set(nonEmptyTitles).size;

    if (hasDuplicates)
      throw new DuplicateException([RESPONSE_MESSAGES.DUPLICATE_GROUP_TITLES]);

    const updatedGroup = await this.groupDatabaseService.findGroupByIdAndUpdate(
      foundGroup._id,
      updateData,
    );

    if (updateData.is_delete) {
      await this.userGroupService.filterAndChangeUserGroup(
        [],
        foundGroup._id,
        USER_GROUP_TYPE.GROUP,
        true,
      );
    }

    return { data: updatedGroup };
  }
}
