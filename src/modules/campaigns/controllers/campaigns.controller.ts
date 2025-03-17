import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { Permissions } from '@common/decorators/permissions.decorator';
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
import { PERMISSIONS } from '@constant/authorization/roles';
import { CampaignService } from '../services/campaign.service';
import { CampaignDatabaseService } from '../services/campaign.database.service';
import {
  GetLeadCampaignNamesRequestQueryDto,
  LeadCampaignsRequestQueryDto,
} from '@dto/leads/lead-campaigns.query.dto';
import { LoggedUser } from '@common/decorators/logged-user.decorator';
import { ILoggedUser } from '@interface/authorization/user';
import { ObjectIDPathDTO } from '@common/dto/object-id.path.dto';
import { RESPONSE_MESSAGES } from '@constant/common/responses';
import { ILeadCampaign } from '@interface/leads/lead-campaign';
import {
  CreateLeadCampaignBodyDto,
  LeadCampaignCheckExistenceDto,
} from '@dto/leads/lead-campaign.request.dto';
import { LogRequest } from '@common/decorators/log-request-response.decorator';
import { DuplicateException } from '@common/filters/duplicate-exception.filter';

@ApiTags('lead-campaign')
@Controller({ path: 'lead-campaign' })
export class CampaignsController {
  constructor(
    private readonly campaignService: CampaignService,
    private readonly campaignDatabaseService: CampaignDatabaseService,
  ) {}

  @ApiOperation({
    summary: 'Get all campaigns',
  })
  @UseGuards(JwtAuthGuard)
  @Permissions(PERMISSIONS.ADMIN)
  @Get()
  async filterCampaigns(@Query() queryParams: LeadCampaignsRequestQueryDto) {
    //Identify the filter criteria
    const filters = this.campaignService.getCampaignsFilters(queryParams);
    //Query for matching values
    const foundList = await this.campaignDatabaseService.filterLeadCampaigns(
      filters,
      queryParams.start ?? 0,
      queryParams.size ?? 0,
    );
    //return result
    return foundList;
  }

  @ApiOperation({ summary: 'Get the campaign names' })
  @UseGuards(JwtAuthGuard)
  @Permissions(PERMISSIONS.ADMIN)
  @Get('search')
  async filterSearchCampaigns(
    @Query() queryParams: GetLeadCampaignNamesRequestQueryDto,
  ) {
    const filters = this.campaignService.getCampaignsFilters(queryParams);

    const result = await this.campaignDatabaseService.filterSearchData(
      filters,
      queryParams.start || 0,
      queryParams.size || 0,
      '$general.name',
    );

    if (!result)
      throw new InternalServerErrorException([RESPONSE_MESSAGES.DB_FAILURE]);

    return result;
  }

  @ApiOperation({
    summary: 'get single lead campaign data',
  })
  @UseGuards(JwtAuthGuard)
  @Permissions(PERMISSIONS.ADMIN)
  @Get('with-status/:id')
  async getSingleLeadCampaignWithStatus(@Param() pathParams: ObjectIDPathDTO) {
    //query for existing document
    const foundData =
      await this.campaignDatabaseService.findDocumentWithPopulated(
        pathParams.id,
      );

    if (!foundData)
      throw new NotFoundException([RESPONSE_MESSAGES.DATA_NOT_FOUND]);

    return { data: foundData };
  }

  @ApiOperation({ summary: 'Get the campaign by id' })
  @UseGuards(JwtAuthGuard)
  @Permissions(PERMISSIONS.ADMIN)
  @Get(':id')
  async getCampaignById(@Param() pathParams: ObjectIDPathDTO) {
    const foundCampaign = await this.campaignDatabaseService.findById(
      pathParams.id,
    );

    if (!foundCampaign)
      throw new NotFoundException([RESPONSE_MESSAGES.DATA_NOT_FOUND]);

    return {
      data: foundCampaign,
    };
  }

  @ApiOperation({
    summary: 'update campaigns data',
  })
  @UseGuards(JwtAuthGuard)
  @Permissions(PERMISSIONS.ADMIN)
  @Patch(':id')
  @LogRequest('lead-campaign -> updateCampaigns')
  async updateCampaigns(
    @LoggedUser() loggedUser: ILoggedUser,
    @Param() pathParams: ObjectIDPathDTO,
    @Body() updateCampaignDto: Partial<ILeadCampaign>,
  ) {
    //query for existing value
    const foundCampaign = await this.campaignDatabaseService.findById(
      pathParams.id,
    );

    if (!foundCampaign)
      throw new NotFoundException([RESPONSE_MESSAGES.DATA_NOT_FOUND]);

    //finding campaign with the same name

    if (updateCampaignDto.general?.name) {
      const duplicateNameCampaign =
        this.campaignService.createFindExistingCampaignName(
          null,
          updateCampaignDto,
        );

      const duplicateCampaigns =
        await this.campaignDatabaseService.findCampaignExistence(
          duplicateNameCampaign,
          pathParams.id,
        );
      if (duplicateCampaigns?.length)
        throw new DuplicateException([
          RESPONSE_MESSAGES.DUPLICATE_LEAD_CAMPAIGN,
        ]);
    }
    //update the data
    const updatedData =
      await this.campaignDatabaseService.findCampaignByIdAndUpdate(
        pathParams.id,
        updateCampaignDto as Partial<ILeadCampaign>,
        loggedUser,
      );

    if (!updatedData)
      throw new InternalServerErrorException([RESPONSE_MESSAGES.DB_FAILURE]);

    return { data: updatedData };
  }

  @ApiOperation({
    summary: 'get single lead campaign data',
  })
  @UseGuards(JwtAuthGuard)
  @Permissions(PERMISSIONS.ADMIN)
  @Get(':id')
  async getSingleLeadCampaign(@Param() pathParams: ObjectIDPathDTO) {
    //query for existing document
    const foundData =
      await this.campaignDatabaseService.findDocumentWithPopulated(
        pathParams.id,
      );

    if (!foundData)
      throw new NotFoundException([RESPONSE_MESSAGES.DATA_NOT_FOUND]);

    return { data: foundData };
  }

  @ApiOperation({
    summary: 'Check Campaign Name already exists',
  })
  @UseGuards(JwtAuthGuard)
  @Permissions(PERMISSIONS.ADMIN)
  @LogRequest('lead-campaign -> checkExistence')
  @Post('check-existence')
  async checkExistence(
    @Body() leadCampaignCheckExistenceDto: LeadCampaignCheckExistenceDto,
  ) {
    const searchFilter = this.campaignService.createFindExistingCampaignName(
      leadCampaignCheckExistenceDto,
    );

    const foundCampaign =
      await this.campaignDatabaseService.findCampaignExistence(
        searchFilter,
        leadCampaignCheckExistenceDto._id,
      );

    return foundCampaign;
  }

  @ApiOperation({
    summary: 'create single lead campaign',
  })
  @UseGuards(JwtAuthGuard)
  @Permissions(PERMISSIONS.ADMIN)
  @Post()
  @LogRequest('lead-campaign -> createLeadCampaign')
  async createLeadCampaign(
    @Body() createLeadCampaignBody: CreateLeadCampaignBodyDto,
    @LoggedUser() loggedUser: ILoggedUser,
  ) {
    const searchFilter = this.campaignService.createFindExistingCampaignName({
      name: createLeadCampaignBody.general.name,
    });

    const foundCampaign =
      await this.campaignDatabaseService.findCampaignExistence(searchFilter);

    if (foundCampaign?.length)
      throw new DuplicateException([RESPONSE_MESSAGES.DUPLICATE_LEAD_CAMPAIGN]);

    const newCampaign = await this.campaignDatabaseService.createNewCampaign(
      createLeadCampaignBody,
      loggedUser,
    );

    if (!newCampaign)
      throw new InternalServerErrorException([RESPONSE_MESSAGES.DB_FAILURE]);

    return { data: newCampaign };
  }
}
