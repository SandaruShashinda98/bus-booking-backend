import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { LeadDatabaseService } from '../services/leads.database.service';
import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { PERMISSIONS } from '@constant/authorization/roles';
import { Permissions } from '@common/decorators/permissions.decorator';
import { ObjectIDPathDTO } from '@common/dto/object-id.path.dto';
import { leadDetailsMap } from '@common/helpers/leadDetailsMap';
import { RESPONSE_MESSAGES } from '@constant/common/responses';
import { LoggedUser } from '@common/decorators/logged-user.decorator';
import { ILoggedUser } from '@interface/authorization/user';
import { Types } from 'mongoose';
import {
  GetLeadInformationQueryParams,
  LeadDetailsEditLeadRequestDTO,
} from '@dto/leads/lead-details.request.dto';
import { LogRequest } from '@common/decorators/log-request-response.decorator';
import { VERSION_NUMBER } from '@constant/common/release-info';

@ApiTags('lead-details')
@Controller({ path: 'lead-details' })
export class LeadDetailsController {
  constructor(private readonly leadDatabaseService: LeadDatabaseService) {}

  // @ApiOperation({
  //   summary: 'Get lead information details',
  // })
  // @UseGuards(JwtAuthGuard)
  // @Permissions(PERMISSIONS.ADMIN)
  // @Get(':id/:menuType')
  // async leadInformationPrimaryDetails(
  //   @Param() pathParams: ObjectIDPathDTO,
  //   @Param('menuType') menuType: string,
  // ) {
  //   if (menuType !== 'campaign-and-engagement-details') {
  //     const foundLeadDetails = await this.leadDatabaseService.findById(
  //       pathParams.id,
  //     );

  //     if (!foundLeadDetails)
  //       throw new NotFoundException([RESPONSE_MESSAGES.DATA_NOT_FOUND]);

  //     //TODO completed the mapping data According to requirements when collections are created
  //     leadDetailsMap(foundLeadDetails);
  //     return { data: foundLeadDetails };
  //   } else {
  //     const leadDetails = await this.leadDatabaseService.findCampaignDetails(
  //       new Types.ObjectId(pathParams.id),
  //     );

  //     return { data: leadDetails?.campaign_id ?? {} };
  //   }
  // }

  @ApiOperation({
    summary: 'Get lead details',
  })
  @LogRequest(`lead-details -> getLeadInformationDetails -> ${VERSION_NUMBER}`)
  @UseGuards(JwtAuthGuard)
  @Permissions(PERMISSIONS.ADMIN)
  @Get(':id')
  async getLeadInformationDetails(
    @Param() pathParams: ObjectIDPathDTO,
    @Query() getLeadInformationQueryParams: GetLeadInformationQueryParams,
  ) {
    const foundLeadDetails = await this.leadDatabaseService.findById(
      pathParams.id,
    );

    if (!foundLeadDetails)
      throw new NotFoundException([RESPONSE_MESSAGES.DATA_NOT_FOUND]);

    if (getLeadInformationQueryParams.country_name) {
      leadDetailsMap(foundLeadDetails);
    }

    return { data: foundLeadDetails };
  }

  @ApiOperation({
    summary: 'Edit lead details',
  })
  @UseGuards(JwtAuthGuard)
  @Permissions(PERMISSIONS.ADMIN)
  @Patch(':id')
  async setLeadInformationDetails(
    @Body() updateLeadInformation: LeadDetailsEditLeadRequestDTO,
    @Param() pathParams: ObjectIDPathDTO,
    @LoggedUser() loggedUser: ILoggedUser,
  ) {
    const updatedLeadInformation =
      await this.leadDatabaseService.findLeadByIdAndUpdate(
        new Types.ObjectId(pathParams.id),
        updateLeadInformation,
        loggedUser,
      );

    if (!updateLeadInformation)
      throw new NotFoundException([RESPONSE_MESSAGES.DATA_NOT_FOUND]);

    return {
      data: updatedLeadInformation,
    };
  }
}
