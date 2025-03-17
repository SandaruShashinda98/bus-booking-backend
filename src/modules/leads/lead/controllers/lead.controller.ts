import {
  Body,
  Controller,
  Get,
  InternalServerErrorException,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { PERMISSIONS } from '@constant/authorization/roles';
import { Permissions } from '@common/decorators/permissions.decorator';
import { LeadDatabaseService } from '../services/leads.database.service';
import { LeadService } from '../services/leads.service';
import { LoggedUser } from '@common/decorators/logged-user.decorator';
import { ObjectIDPathDTO } from '@common/dto/object-id.path.dto';
import { PermissionGuard } from '@common/guards/permission.guard';
import { ILoggedUser } from '@interface/authorization/user';
import { Types } from 'mongoose';
import { RESPONSE_MESSAGES } from '@constant/common/responses';
import { ILead } from '@interface/leads/leads';
import { LogRequest } from '@common/decorators/log-request-response.decorator';
import { LEAD_DENY_STATUS } from '@constant/leads/leads';
import { LeadCommentsDatabaseService } from '@module/leads/lead-comments/lead-comment.database.service';
import { GroupDatabaseService } from '@module/groups/services/group.database.service';
import { LeadGroupFilterService } from '../services/lead-group-filter.service';

@ApiTags('leads')
@Controller({ path: 'leads' })
export class LeadController {
  constructor(
    private readonly groupDatabaseService: GroupDatabaseService,
    private readonly leadGroupFilterService: LeadGroupFilterService,
    private readonly leadService: LeadService,
    private readonly leadDatabaseService: LeadDatabaseService,
    private readonly leadCommentsDatabaseService: LeadCommentsDatabaseService,
  ) {}

  @ApiOperation({ summary: 'Get lead details by number' })
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Permissions(PERMISSIONS.ADMIN, PERMISSIONS.AGENT)
  @Get()
  @LogRequest('leads -> getLeadByPhoneNumber')
  async getLeadByPhoneNumber(
    @Query('phone') phone: string,
    @LoggedUser() loggedUser: ILoggedUser,
  ) {
    return this.leadDatabaseService.findOrCreateLeadByPhone(phone, loggedUser);
  }

  @ApiOperation({ summary: 'Create new lead' })
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Permissions(PERMISSIONS.ADMIN, PERMISSIONS.AGENT)
  @Post()
  @LogRequest('leads -> createLead')
  async createLead(
    @Body() createLeadDto: any,
    @LoggedUser() loggedUser: ILoggedUser,
  ) {
    const leadData: Partial<ILead> = {
      ...createLeadDto,
      is_active: createLeadDto.is_active ?? true,
    };

    const newLead = await this.leadDatabaseService.createNewLead(
      leadData,
      loggedUser,
    );

    if (!newLead)
      throw new InternalServerErrorException([RESPONSE_MESSAGES.DB_FAILURE]);

    return { data: newLead };
  }

  @ApiOperation({ summary: 'Create or find lead details by number' })
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Permissions(PERMISSIONS.ADMIN, PERMISSIONS.AGENT)
  @Post('phone')
  @LogRequest('leads -> createLeadByPhoneNumber')
  async createLeadByPhoneNumber(
    @Query('phone') phone: string,
    @LoggedUser() loggedUser: ILoggedUser,
  ) {
    return this.leadDatabaseService.findOrCreateLeadByPhone(phone, loggedUser);
  }

  @ApiOperation({
    summary: 'Get all leads with pagination',
  })
  @UseGuards(JwtAuthGuard)
  @Permissions(PERMISSIONS.ADMIN, PERMISSIONS.AGENT)
  @Post('list')
  async filterLeads(@Body() queryParams: any) {
    const filters = this.leadService.getLeadFilters(queryParams);

    const foundList = await this.leadDatabaseService.filterLeadsWithPagination(
      filters,
      Number(queryParams.start) || 0,
      Number(queryParams.size) || 0,
      LEAD_DENY_STATUS.ALLOWED,
    );

    return foundList;
  }

  @ApiOperation({
    summary: 'Get all leads with pagination according to lead filter group',
  })
  @UseGuards(JwtAuthGuard)
  @Permissions(PERMISSIONS.ADMIN, PERMISSIONS.AGENT)
  @Post('group-filter')
  async filterByGroup(@Body() queryParams: any) {
    if (!queryParams.groupId)
      throw new NotFoundException([RESPONSE_MESSAGES.DATA_NOT_FOUND]);

    const foundGroup = await this.groupDatabaseService.findById(
      queryParams.groupId,
    );

    if (!foundGroup)
      throw new NotFoundException([RESPONSE_MESSAGES.DATA_NOT_FOUND]);

    const filters = await this.leadGroupFilterService.filterLeadsByGroup(
      foundGroup,
      queryParams.searchKey,
    );

    const foundList = await this.leadDatabaseService.filterLeadsByGroup(
      filters,
      Number(queryParams.start) || 0,
      Number(queryParams.size) || 0,
    );

    return foundList;
  }

  @ApiOperation({ summary: 'Update a lead' })
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Permissions(PERMISSIONS.ADMIN, PERMISSIONS.AGENT)
  @Patch('delete/:id')
  @LogRequest('leads -> deleteLead')
  async deleteLead(
    @LoggedUser() loggedUser: ILoggedUser,
    @Param() pathParams: ObjectIDPathDTO,
  ) {
    const updatedLead = await this.leadDatabaseService.findLeadByIdAndUpdate(
      new Types.ObjectId(pathParams.id),
      { is_delete: true },
      loggedUser,
    );

    if (!updatedLead)
      throw new InternalServerErrorException([RESPONSE_MESSAGES.DB_FAILURE]);

    if (updatedLead)
      await this.leadCommentsDatabaseService.filterAndDelete({
        lead_id: new Types.ObjectId(pathParams.id),
      });

    return { data: updatedLead };
  }

  @ApiOperation({ summary: 'Update a lead' })
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Permissions(PERMISSIONS.ADMIN, PERMISSIONS.AGENT)
  @Patch(':id')
  @LogRequest('leads -> updateLead')
  async updateLead(
    @LoggedUser() loggedUser: ILoggedUser,
    @Param() pathParams: ObjectIDPathDTO,
    @Body() updateLeadDto: any,
  ) {
    const updatedLead = await this.leadDatabaseService.findLeadByIdAndUpdate(
      new Types.ObjectId(pathParams.id),
      updateLeadDto,
      loggedUser,
    );

    if (!updatedLead)
      throw new InternalServerErrorException([RESPONSE_MESSAGES.DB_FAILURE]);

    return { data: updatedLead };
  }
}
