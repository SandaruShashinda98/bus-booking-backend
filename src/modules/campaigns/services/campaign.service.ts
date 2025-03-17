import { LEAD_CAMPAIGN_STATUS } from '@constant/leads/lead-campaign';
import { LeadCampaignCheckExistenceDto } from '@dto/leads/lead-campaign.request.dto';
import { LeadCampaignsRequestQueryDto } from '@dto/leads/lead-campaigns.query.dto';
import { ILeadCampaign } from '@interface/leads/lead-campaign';
import { Injectable } from '@nestjs/common';
import { FilterQuery, Types } from 'mongoose';

@Injectable()
export class CampaignService {
  constructor() {}

  getCampaignsFilters(
    queryParams: LeadCampaignsRequestQueryDto,
  ): FilterQuery<LeadCampaignsRequestQueryDto> {
    //The following function creates the filter for campaigns
    const filter: FilterQuery<LeadCampaignsRequestQueryDto> = {
      ...(Array.isArray(queryParams.campaign) && queryParams.campaign.length
        ? {
            _id: {
              $in: queryParams.campaign.map((id) => new Types.ObjectId(id)),
            },
          }
        : {}),
      ...(queryParams.status === LEAD_CAMPAIGN_STATUS.ACTIVE
        ? { 'general.is_active_campaign': true }
        : queryParams.status === LEAD_CAMPAIGN_STATUS.DISABLED
          ? { 'general.is_active_campaign': false }
          : {}),
      is_delete: false,
    };

    return filter;
  }

  createFindExistingCampaignName(
    leadCampaignCheckExistenceDto: LeadCampaignCheckExistenceDto = undefined,
    updateCampaignDto: Partial<ILeadCampaign> = undefined,
  ) {
    if (updateCampaignDto) {
      return {
        'general.name': updateCampaignDto.general?.name,
        is_delete: false,
      };
    } else {
      return {
        'general.name': leadCampaignCheckExistenceDto.name,
        is_delete: false,
      };
    }
  }
}
