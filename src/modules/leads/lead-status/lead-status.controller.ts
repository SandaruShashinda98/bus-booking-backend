import {
  BadRequestException,
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
import { LeadStatusService } from './lead-status.service';
import { LeadStatusDatabaseService } from './lead-status.database.service';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { PERMISSIONS } from '@constant/authorization/roles';
import { Permissions } from '@common/decorators/permissions.decorator';
import {
  GetLeadStatusNamesRequestQueryDto,
  LeadStatusRequestQueryDto,
} from '@dto/leads/lead-status.request.query.dto';
import {
  LeadStatusDto,
  UpdateLeadStatusDto,
} from '@dto/leads/lead-status.request.dto';
import { LoggedUser } from '@common/decorators/logged-user.decorator';
import { ILoggedUser } from '@interface/authorization/user';
import { RESPONSE_MESSAGES } from '@constant/common/responses';
import { LogRequest } from '@common/decorators/log-request-response.decorator';
import { ObjectIDPathDTO } from '@common/dto/object-id.path.dto';
import { ILeadStatus } from '@interface/leads/lead-status';
import { DuplicateException } from '@common/filters/duplicate-exception.filter';

@ApiTags('lead-status')
@Controller({ path: 'lead-status' })
export class LeadStatusController {
  constructor(
    private readonly leadStatusService: LeadStatusService,
    private readonly leadStatusDatabaseService: LeadStatusDatabaseService,
  ) {}

  @ApiOperation({
    summary: 'Get Lead Status Data',
  })
  @UseGuards(JwtAuthGuard)
  @Permissions(PERMISSIONS.ADMIN)
  @Get('search/:id')
  async filterLeadStatus(
    @Query() queryParams: LeadStatusRequestQueryDto,
    @Param() pathParams: ObjectIDPathDTO,
  ) {
    const filter = this.leadStatusService.getLeadStatusFilters(pathParams.id);

    const foundList = await this.leadStatusDatabaseService.filterLeadCampaigns(
      filter,
      queryParams.start ?? 0,
      queryParams.size ?? 0,
    );

    return foundList;
  }

  @ApiOperation({ summary: 'Get Lead Status names and IDs' })
  @UseGuards(JwtAuthGuard)
  @Permissions(PERMISSIONS.ADMIN)
  @Get('search')
  async getLeadStatusNamesAndIDs(
    @Query() queryParams: GetLeadStatusNamesRequestQueryDto,
    @Param() pathParams: ObjectIDPathDTO,
  ) {
    const filters = this.leadStatusService.getLeadStatusFilters(pathParams.id);

    const result = await this.leadStatusDatabaseService.filterSearchData(
      filters,
      queryParams.start ?? 0,
      queryParams.size ?? 0,
      '$name',
    );

    if (!result)
      throw new InternalServerErrorException([RESPONSE_MESSAGES.DB_FAILURE]);

    return result;
  }

  @ApiOperation({
    summary: 'Create Lead Status',
  })
  @UseGuards(JwtAuthGuard)
  @Permissions(PERMISSIONS.ADMIN)
  @Post()
  @LogRequest('lead-status -> createLeadStatus')
  async createLeadStatus(
    @Body() createLeadStatusDto: LeadStatusDto,
    @LoggedUser() LoggedUser: ILoggedUser,
  ) {
    const existingLeadStatusName =
      await this.leadStatusDatabaseService.findDocument(
        this.leadStatusService.getFilterForDuplicates(createLeadStatusDto),
      );

    if (existingLeadStatusName)
      throw new BadRequestException([RESPONSE_MESSAGES.DUPLICATE_LEAD_STATUS]);

    const newLeadStatus =
      await this.leadStatusDatabaseService.createNewLeadStatus(
        createLeadStatusDto,
        LoggedUser,
      );

    if (!newLeadStatus)
      throw new InternalServerErrorException([RESPONSE_MESSAGES.DB_FAILURE]);

    return { data: newLeadStatus };
  }

  @ApiOperation({
    summary: 'Update Lead Status',
  })
  @UseGuards(JwtAuthGuard)
  @Permissions(PERMISSIONS.ADMIN)
  @Patch(':id')
  @LogRequest('lead-status->updateLeadStatus')
  async updateLeaStatus(
    @Body() updateLeadStatusDto: UpdateLeadStatusDto,
    @Param() pathParams: ObjectIDPathDTO,
    @LoggedUser() loggedUser: ILoggedUser,
  ) {
    const foundLeadStatus = await this.leadStatusDatabaseService.findById(
      pathParams.id,
    );

    if (!foundLeadStatus)
      throw new NotFoundException([RESPONSE_MESSAGES.DB_FAILURE]);

    const duplicateLeadStatus =
      await this.leadStatusDatabaseService.findExistingLeadStatus(
        updateLeadStatusDto,
        pathParams.id,
      );

    if (duplicateLeadStatus)
      throw new DuplicateException([RESPONSE_MESSAGES.DUPLICATE_LEAD_STATUS]);

    const updateData =
      await this.leadStatusDatabaseService.findStatusByIdAndUpdate(
        pathParams.id,
        updateLeadStatusDto as Partial<ILeadStatus>,
        loggedUser,
      );

    if (!updateData)
      throw new InternalServerErrorException([RESPONSE_MESSAGES.DB_FAILURE]);

    return { data: updateData };
  }

  @ApiOperation({
    summary: 'Get Single Lead Status Data',
  })
  @Permissions(PERMISSIONS.ADMIN)
  @Get(':id')
  async getSingleLeadStatus(@Param() pathParams: ObjectIDPathDTO) {
    const foundData = await this.leadStatusDatabaseService.findById(
      pathParams.id,
    );

    if (!foundData)
      throw new NotFoundException([RESPONSE_MESSAGES.DATA_NOT_FOUND]);

    return { data: foundData };
  }
}
