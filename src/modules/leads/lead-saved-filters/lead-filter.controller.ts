import {
  Controller,
  Query,
  UseGuards,
  Get,
  Param,
  NotFoundException,
  Post,
  Body,
  InternalServerErrorException,
  Patch,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { PERMISSIONS } from '@constant/authorization/roles';
import { Permissions } from '@common/decorators/permissions.decorator';
import { LeadsFilterDatabaseService } from './lead-filter.database.service';
import { PermissionGuard } from '@common/guards/permission.guard';
import { LogRequest } from '@common/decorators/log-request-response.decorator';
import { ObjectIDPathDTO } from '@common/dto/object-id.path.dto';
import { RESPONSE_MESSAGES } from '@constant/common/responses';
import {
  FilterLeadEntityFilterResponseDto,
  LeadEntityFilterResponseDto,
} from '@dto/leads/leads-entities-filter-response.dto';
import { GetLeadFilterEntityQueryDTO } from '@dto/leads/leads-entities-filter-query-params.dto';
import { LoggedUser } from '@common/decorators/logged-user.decorator';
import { ILoggedUser } from '@interface/authorization/user';
import { CreateLeadFilterDto } from '@dto/leads/leads-entities-filter-request.dto';
import { DuplicateException } from '@common/filters/duplicate-exception.filter';
import { ILeadFilter } from '@interface/leads/leads';
import { cleanEmptyValues } from '@common/helpers/custom.helper';
import { TRI_STATUS } from '@constant/leads/leads';

@ApiTags('lead-filters')
@Controller({ path: 'lead-filters' })
export class LeadEntityFilterController {
  constructor(
    private readonly leadFilterDatabaseService: LeadsFilterDatabaseService,
  ) {}

  @ApiOperation({
    summary: 'Get all lead saved filters with pagination',
  })
  @ApiResponse({ type: FilterLeadEntityFilterResponseDto })
  @UseGuards(JwtAuthGuard)
  @Permissions(PERMISSIONS.ADMIN)
  @Get()
  async filterLeadFilter(@Query() queryParams: GetLeadFilterEntityQueryDTO) {
    //get filters for lead filters
    const filters =
      this.leadFilterDatabaseService.getLeadEntityFilterFilters(queryParams);

    //get lead filter data from database
    const foundList =
      await this.leadFilterDatabaseService.filterDocumentsWithPagination(
        filters,
        Number(queryParams.start) || 0,
        Number(queryParams.size) || 0,
      );

    return foundList;
  }

  @ApiOperation({
    summary: 'Get single lead saved filter by id',
  })
  @ApiResponse({ type: LeadEntityFilterResponseDto })
  @UseGuards(JwtAuthGuard)
  @Permissions(PERMISSIONS.ADMIN)
  @Get(':id')
  async getSingleLeadFilter(@Param() pathParams: ObjectIDPathDTO) {
    const foundLeadFilter = await this.leadFilterDatabaseService.findById(
      pathParams.id,
    );

    if (!foundLeadFilter)
      throw new NotFoundException([RESPONSE_MESSAGES.DATA_NOT_FOUND]);

    return { data: foundLeadFilter };
  }

  @ApiOperation({ summary: 'Create new lead filter' })
  @ApiResponse({ type: LeadEntityFilterResponseDto })
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Permissions(PERMISSIONS.ADMIN)
  @LogRequest('leads-filters -> createLeadFilter')
  @Post()
  async createLeadFilter(
    @Body() createLeadFilterDto: any,
    @LoggedUser() loggedUser: ILoggedUser,
  ) {
    //search for duplicates
    const foundDuplicates = await this.leadFilterDatabaseService.findDocument({
      filter_name: createLeadFilterDto.filter_name,
      is_delete: false,
    });

    if (foundDuplicates)
      throw new DuplicateException([RESPONSE_MESSAGES.DUPLICATE_LEAD_FILTER]);

    const cleanedFilterDto = cleanEmptyValues(createLeadFilterDto);

    const filterData = {
      ...cleanedFilterDto,
      campaigns_and_engagement_details: {
        ...cleanedFilterDto.campaigns_and_engagement_details,
        duplicate:
          cleanedFilterDto?.campaigns_and_engagement_details?.duplicate ??
          TRI_STATUS.ANY,
        with_error:
          cleanedFilterDto?.campaigns_and_engagement_details?.with_error ??
          TRI_STATUS.ANY,
      },
      system_details: {
        ...cleanedFilterDto.system_details,
        is_deleted:
          cleanedFilterDto?.system_details?.is_deleted ?? TRI_STATUS.ANY,
      },
    };

    //create if no duplicates
    const newLeadFilter =
      await this.leadFilterDatabaseService.createNewLeadFilter(
        filterData as ILeadFilter,
        loggedUser,
      );

    if (!newLeadFilter)
      throw new InternalServerErrorException([RESPONSE_MESSAGES.DB_FAILURE]);

    return { data: newLeadFilter };
  }

  @ApiOperation({ summary: 'Create new lead filter' })
  @ApiResponse({ type: LeadEntityFilterResponseDto })
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Permissions(PERMISSIONS.ADMIN)
  @LogRequest('leads-filters -> multipleFilterDelete')
  @Post('multiple-delete')
  async multipleFilterDelete(
    @Body()
    multiDeleteLeadFilterDto: {
      is_delete_all: boolean;
      selected_filters: string[];
    },
  ) {
    const result = await this.leadFilterDatabaseService.deleteBulkLeadFilters(
      multiDeleteLeadFilterDto,
    );

    return { data: result };
  }

  @ApiOperation({ summary: 'Update Lead Filter' })
  @ApiResponse({ type: CreateLeadFilterDto })
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Permissions(PERMISSIONS.ADMIN)
  @LogRequest('leads-filters -> updateLeadFilter')
  @Patch(':id')
  async updateLeadFilter(
    @LoggedUser() LoggedUser: ILoggedUser,
    @Param() pathParams: ObjectIDPathDTO,
    @Body() updateLeadFilterData: any,
  ) {
    const foundFilter = await this.leadFilterDatabaseService.findById(
      pathParams.id,
    );

    if (!foundFilter)
      throw new NotFoundException([RESPONSE_MESSAGES.DATA_NOT_FOUND]);

    const updateData = {
      ...foundFilter,
      ...updateLeadFilterData,
      changed_by: LoggedUser._id,
      is_delete: updateLeadFilterData.is_delete ?? foundFilter.is_delete,
      last_modified_on: new Date(),
    };

    //update data
    const updatedList =
      await this.leadFilterDatabaseService.findLeadFilterByIdAndUpdate(
        pathParams.id,
        updateData as ILeadFilter,
      );

    if (!updatedList)
      throw new InternalServerErrorException([RESPONSE_MESSAGES.DB_FAILURE]);

    return { data: updatedList };
  }
}
