import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Param,
  NotFoundException,
  InternalServerErrorException,
  Patch,
  Query,
} from '@nestjs/common';
import { LeadFileService } from './lead-file.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { PERMISSIONS } from '@constant/authorization/roles';
import { Permissions } from '@common/decorators/permissions.decorator';
import { ObjectIDPathDTO } from '@common/dto/object-id.path.dto';
import { UploadDatabaseService } from '@module/upload/services/upload.database.service';
import { RESPONSE_MESSAGES } from '@constant/common/responses';
import { ILoggedUser } from '@interface/authorization/user';
import { LoggedUser } from '@common/decorators/logged-user.decorator';
import { Types } from 'mongoose';
import { LogRequest } from '@common/decorators/log-request-response.decorator';
import { GetLeadFileNamesRequestQueryDto } from '@dto/leads/leads-query-params.dto';
import { LeadFileAssignToCampaignRequestDto } from '@dto/leads/lead-files.request.dto';
import { LeadDatabaseService } from '../lead/services/leads.database.service';

@ApiTags('lead-files')
@Controller({ path: 'lead-files' })
export class LeadFileController {
  constructor(
    private readonly leadFileService: LeadFileService,
    private readonly uploadDatabaseService: UploadDatabaseService,
    private readonly leadDatabaseService: LeadDatabaseService,
  ) {}

  @ApiOperation({
    summary: 'Get the transformed enum values',
  })
  @UseGuards(JwtAuthGuard)
  @Get('column-data-types')
  getLeadColumnTypes() {
    return this.leadFileService.getLeadColumnTypes();
  }

  @ApiOperation({
    summary: 'Receive an array of data types and process them',
  })
  @UseGuards(JwtAuthGuard)
  @LogRequest('lead-files -> storeFieldData')
  @Post('import')
  storeFieldData(
    @Body() body: { upload_id: string; key: string; fields: string[] },
  ) {
    const { upload_id, key, fields } = body;
    return this.leadFileService.importFileData(upload_id, key, fields);
  }

  @ApiOperation({
    summary: 'Get Lead File Names for search',
  })
  @UseGuards(JwtAuthGuard)
  @Permissions(PERMISSIONS.ADMIN)
  @Get('search')
  async getLeadFileNames(
    @Query() queryParams: GetLeadFileNamesRequestQueryDto,
  ) {
    const filters = this.leadFileService.getLeadFileFilters(queryParams);

    const result = await this.uploadDatabaseService.filterSearchData(
      filters,
      queryParams.start || 0,
      queryParams.size || 0,
      '$file_name',
    );

    if (!result)
      throw new InternalServerErrorException([RESPONSE_MESSAGES.DB_FAILURE]);

    return result;
  }

  @ApiOperation({
    summary: 'Get lead file status',
  })
  // @ApiResponse({ type: FilterLeadEntityFilterResponseDto })
  @UseGuards(JwtAuthGuard)
  @Permissions(PERMISSIONS.ADMIN)
  @Get('status/:id')
  async getLeadFileStatus(@Param() pathParams: ObjectIDPathDTO) {
    const foundData = await this.uploadDatabaseService.findById(pathParams.id);

    if (!foundData)
      throw new NotFoundException([RESPONSE_MESSAGES.DATA_NOT_FOUND]);

    return {
      data: {
        status: foundData.status,
      },
    };
  }

  @ApiOperation({
    summary: 'Get stat for a selected lead',
  })
  @UseGuards(JwtAuthGuard)
  @Permissions(PERMISSIONS.ADMIN)
  @Get('stat/:id')
  async getLeadStat(@Param() pathParams: ObjectIDPathDTO) {
    const _data = await this.uploadDatabaseService.findById(pathParams.id);

    if (!_data) throw new NotFoundException([RESPONSE_MESSAGES.DATA_NOT_FOUND]);

    const data = this.leadFileService.addCountryDataToLeadFile(_data);

    return { data };
  }

  @ApiOperation({
    summary: 'Get lead file by id',
  })
  @UseGuards(JwtAuthGuard)
  @Permissions(PERMISSIONS.ADMIN)
  @Get(':id')
  async getLeadFileByID(@Param() pathParams: ObjectIDPathDTO) {
    const foundData = await this.uploadDatabaseService.findById(pathParams.id);

    if (!foundData)
      throw new NotFoundException([RESPONSE_MESSAGES.DATA_NOT_FOUND]);

    return {
      data: foundData,
    };
  }

  @ApiOperation({
    summary: 'Get all lead entity filters with pagination',
  })
  // @ApiResponse({ type: FilterLeadEntityFilterResponseDto })
  @UseGuards(JwtAuthGuard)
  @Permissions(PERMISSIONS.ADMIN)
  @Post('list')
  @LogRequest('lead-files -> filterLeadFilterEntity')
  async filterLeadFilterEntity(@Body() filterBody: any) {
    const filters = this.leadFileService.getLeadFileFilters(filterBody);

    const foundList =
      await this.uploadDatabaseService.filterUploadsWithPagination(
        filters,
        filterBody.campaigns,
        Number(filterBody.start) || 0,
        Number(filterBody.size) || 0,
      );

    return foundList;
  }

  @ApiOperation({
    summary: 'Update selected lead file',
  })
  // @ApiResponse({ type: FilterLeadEntityFilterResponseDto })
  @UseGuards(JwtAuthGuard)
  @Permissions(PERMISSIONS.ADMIN)
  @LogRequest('lead-files -> updateLeadFile')
  @Patch(':id')
  async updateLeadFile(
    @LoggedUser() loggedUser: ILoggedUser,
    @Param() pathParams: ObjectIDPathDTO,
    @Body() body: any,
  ) {
    const foundData = await this.uploadDatabaseService.findById(pathParams.id);

    if (!foundData)
      throw new NotFoundException([RESPONSE_MESSAGES.DATA_NOT_FOUND]);

    const updateData = {
      ...foundData,
      ...body,
    };

    try {
      const updatedLeadFile =
        await this.uploadDatabaseService.handleLeadFileUpdate(
          new Types.ObjectId(pathParams.id),
          updateData,
          loggedUser,
        );
      return { data: updatedLeadFile };
    } catch (error) {
      throw new InternalServerErrorException([RESPONSE_MESSAGES.DB_FAILURE]);
    }
  }

  @ApiOperation({
    summary: 'Add leads to campaigns',
  })
  @UseGuards(JwtAuthGuard)
  @Permissions(PERMISSIONS.ADMIN)
  @LogRequest('lead-files->assignToCampaign')
  @Post('assign-to-campaign')
  async assignToCampaign(
    @LoggedUser() LoggedUser: ILoggedUser,
    @Body() bodyContent: LeadFileAssignToCampaignRequestDto,
  ) {
    try {
      const addToCampaignResult =
        await this.leadDatabaseService.assignToCampaign(
          LoggedUser,
          bodyContent,
        );
      return addToCampaignResult;
    } catch {
      throw new InternalServerErrorException([RESPONSE_MESSAGES.DB_FAILURE]);
    }
  }
}
