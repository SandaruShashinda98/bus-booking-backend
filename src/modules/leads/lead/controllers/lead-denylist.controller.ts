import {
  Controller,
  UseGuards,
  Post,
  Body,
  Param,
  InternalServerErrorException,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { PERMISSIONS } from '@constant/authorization/roles';
import { Permissions } from '@common/decorators/permissions.decorator';
import { LeadService } from '../services/leads.service';
import { LeadDatabaseService } from '../services/leads.database.service';
import { LogRequest } from '@common/decorators/log-request-response.decorator';
import { LeadDenyListService } from '../services/lead-deny-list.service';
import {
  CompleteAddCSVDto,
  CompleteAddMultiPartCSVDto,
  DenyStatusChangeDto,
} from '@dto/leads/lead-deny-list.request.dto';
import { RESPONSE_MESSAGES } from '@constant/common/responses';
import { LoggedUser } from '@common/decorators/logged-user.decorator';
import { ILoggedUser } from '@interface/authorization/user';
import { LEAD_DENY_STATUS } from '@constant/leads/leads';

@ApiTags('lead-deny-list')
@Controller({ path: 'lead-deny-list' })
export class LeadDenyListController {
  constructor(
    private readonly leadDatabaseService: LeadDatabaseService,
    private readonly leadService: LeadService,
    private readonly leadDenyListService: LeadDenyListService,
  ) {}

  // 1. Static POST routes first
  @ApiOperation({
    summary: 'Get all lead deny list with pagination',
  })
  @UseGuards(JwtAuthGuard)
  @Permissions(PERMISSIONS.ADMIN)
  @Post('list')
  async filterLeadDenyList(@Body() queryParams: any) {
    const filters = this.leadService.getLeadDenyListFilters(queryParams, false);

    const foundDenyList =
      await this.leadDatabaseService.filterLeadsWithPagination(
        filters,
        Number(queryParams.start) || 0,
        Number(queryParams.size) || 0,
        LEAD_DENY_STATUS.DENIED,
      );

    return foundDenyList;
  }

  @ApiOperation({
    summary: 'Get all lead deny list for review list with pagination',
  })
  @UseGuards(JwtAuthGuard)
  @Permissions(PERMISSIONS.ADMIN)
  @LogRequest('lead-deny-list -> filterLeadDenyListReview')
  @Post('review-list')
  async filterLeadDenyListReview(@Body() queryParams: any) {
    const filters = this.leadService.getLeadDenyListFilters(queryParams, true);

    const foundReviewList =
      await this.leadDatabaseService.filterLeadsWithPagination(
        filters,
        Number(queryParams.start) || 0,
        Number(queryParams.size) || 0,
        LEAD_DENY_STATUS.PENDING_DENY,
      );

    return foundReviewList;
  }

  @ApiOperation({
    summary: 'Get lead deny list export as csv downloadable link',
  })
  @UseGuards(JwtAuthGuard)
  @Permissions(PERMISSIONS.ADMIN)
  @LogRequest('lead-deny-list -> exportDenyList')
  @Post('export')
  async exportDenyList(@Body() queryParams: any) {
    const filters = this.leadService.getLeadDenyListFilters(queryParams, true);

    const foundList = await this.leadDatabaseService.filterLeadsWithPagination(
      filters,
      Number(queryParams.start) || 0,
      Number(queryParams.size) || 0,
    );

    const downloadUrl = await this.leadService.exportLeadsAsCSV(foundList.data);

    if (!downloadUrl)
      throw new InternalServerErrorException([
        RESPONSE_MESSAGES.CSV_GENERATE_ERROR,
      ]);

    return {
      data: {
        download_url: downloadUrl,
      },
    };
  }

  @ApiOperation({
    summary: 'Add to deny list with CSV',
  })
  @UseGuards(JwtAuthGuard)
  @Permissions(PERMISSIONS.ADMIN)
  @LogRequest('lead-deny-list -> addSinglePartFileToDenyList')
  @Post('complete-add-csv/:key')
  async addSinglePartFileToDenyList(
    @Param('key') key: string,
    @Body() completeAddCSVDto: CompleteAddCSVDto,
    @LoggedUser() LoggedUser: ILoggedUser,
  ) {
    const phoneNumbers = await this.leadDenyListService.getFileContent(key);

    if (!phoneNumbers) throw new Error(`Error Occurred while processing file`);
    try {
      const duplicatePhoneNumbers =
        await this.leadDatabaseService.getDuplicatePhoneNumbers(phoneNumbers);

      const uniquePhoneNumbersData =
        this.leadDenyListService.createInsertDocument(
          phoneNumbers,
          duplicatePhoneNumbers,
          completeAddCSVDto.preApproved,
        );

      await this.leadDatabaseService.updateDenyListLeads(
        phoneNumbers,
        completeAddCSVDto.preApproved,
        LoggedUser,
      );

      const databaseResult =
        await this.leadDatabaseService.bulkInsertLeadsWithPhone(
          uniquePhoneNumbersData,
        );

      return { result: databaseResult };
    } catch {
      throw new InternalServerErrorException([RESPONSE_MESSAGES.DB_FAILURE]);
    }
  }

  @ApiOperation({
    summary: 'Add to deny list with CSV',
  })
  @UseGuards(JwtAuthGuard)
  @Permissions(PERMISSIONS.ADMIN)
  @LogRequest('lead-deny-list -> addMultiPartFileToDenyList')
  @Post('multi-complete-add-csv/:key')
  async addMultiPartFileToDenyList(
    @Param('key') key: string,
    @Body() completeAddMultiPartCSVDto: CompleteAddMultiPartCSVDto,
    @LoggedUser() LoggedUser: ILoggedUser,
  ) {
    await this.leadDenyListService.completeMultiPartUpload(
      key,
      completeAddMultiPartCSVDto.uploadId,
      completeAddMultiPartCSVDto.parts,
    );

    const phoneNumbers = await this.leadDenyListService.getFileContent(key);
    if (!phoneNumbers) throw new Error(`Error Occurred while processing file`);

    try {
      const duplicatePhoneNumbers =
        await this.leadDatabaseService.getDuplicatePhoneNumbers(phoneNumbers);

      const uniquePhoneNumbersData =
        this.leadDenyListService.createInsertDocument(
          phoneNumbers,
          duplicatePhoneNumbers,
          completeAddMultiPartCSVDto.preApproved,
        );

      await this.leadDatabaseService.updateDenyListLeads(
        phoneNumbers,
        completeAddMultiPartCSVDto.preApproved,
        LoggedUser,
      );

      const databaseResult =
        await this.leadDatabaseService.bulkInsertLeadsWithPhone(
          uniquePhoneNumbersData,
        );

      return { result: databaseResult };
    } catch {
      throw new InternalServerErrorException([RESPONSE_MESSAGES.DB_FAILURE]);
    }
  }

  @ApiOperation({
    summary: 'Add to deny list with CSV',
  })
  @UseGuards(JwtAuthGuard)
  @Permissions(PERMISSIONS.ADMIN)
  @LogRequest('lead-deny-list -> modifyChangeStatus')
  @Post('modify-deny-status')
  async modifyChangeStatus(
    @Body() denyStatusChangeDto: DenyStatusChangeDto,
    @LoggedUser() LoggedUser: ILoggedUser,
  ) {
    const filter =
      this.leadDenyListService.getUpdateFilterForDenyStatusModify(
        denyStatusChangeDto,
      );
    const updatedDocuments =
      await this.leadDatabaseService.updateMultipleDocumentsFromArray(
        denyStatusChangeDto.status,
        filter,
        LoggedUser,
      );

    if (!updatedDocuments)
      throw new InternalServerErrorException([RESPONSE_MESSAGES.DB_FAILURE]);

    return updatedDocuments;
  }
}
