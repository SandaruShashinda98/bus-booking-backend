import { LeadStatusDto } from '@dto/leads/lead-status.request.dto';
import { Injectable } from '@nestjs/common';
import { Types } from 'mongoose';

@Injectable()
export class LeadStatusService {
  constructor() {}

  getLeadStatusFilters(id: string) {
    return { is_delete: false, campaign_id: new Types.ObjectId(id) };
  }

  getFilterForDuplicates(leadStatusDto: LeadStatusDto) {
    return {
      name: leadStatusDto.name,
      is_delete: false,
      campaign_id: leadStatusDto.campaign_id,
    };
  }
}
