import {
  convertToIdArray,
  regexPhoneNumberFilter,
  regexStringFilter,
} from '@common/helpers/custom.helper';
import { ExportService } from '@common/services/export.service';
import { LEAD_DENY_STATUS } from '@constant/leads/leads';
import { Injectable, Logger } from '@nestjs/common';
import { FilterQuery } from 'mongoose';

@Injectable()
export class LeadService {
  constructor(private readonly exportService: ExportService) {}

  /**
   * This function generates filter criteria based on search key and ID for leads
   */
  getLeadFilters(queryParams: any) {
    const { filter_object } = queryParams;
    const leadDetails = filter_object?.lead_details;
    const campaignDetails = filter_object?.campaigns_and_engagement_details;
    const systemDetails = filter_object?.system_details;

    const filterCriteria: FilterQuery<any> = { is_delete: false };
    filterCriteria.deny_status = LEAD_DENY_STATUS.ALLOWED;

    //lead details
    if (leadDetails) {
      if (leadDetails?.first_name)
        filterCriteria.first_name = regexStringFilter(leadDetails?.first_name);

      if (leadDetails?.last_name)
        filterCriteria.last_name = regexStringFilter(leadDetails?.last_name);

      if (leadDetails?.phone_number)
        filterCriteria.phone = regexPhoneNumberFilter(
          leadDetails?.phone_number,
        );

      if (leadDetails?.secondary_phone)
        filterCriteria.secondary_phone = regexPhoneNumberFilter(
          leadDetails?.secondary_phone,
        );
    }

    //campaign details
    if (campaignDetails) {
      if (campaignDetails?.campaigns?.length > 0)
        filterCriteria.campaign_id = {
          $in: convertToIdArray(campaignDetails.campaigns),
        };
    }

    //system details
    if (systemDetails) {
      if (systemDetails?.lead_file_name?.length > 0)
        filterCriteria.upload_id = {
          $in: convertToIdArray(systemDetails?.lead_file_name),
        };
    }
    return filterCriteria;
  }

  /**
   * This function generates filter deny list criteria based on search key and ID for leads
   */
  getLeadDenyListFilters(queryParams: any, isReview: boolean = false) {
    const { first_name, last_name, phone } = queryParams;

    const filterCriteria: FilterQuery<any> = { is_delete: false };

    filterCriteria.deny_status = isReview
      ? LEAD_DENY_STATUS.PENDING_DENY
      : LEAD_DENY_STATUS.DENIED;

    if (first_name) filterCriteria.first_name = regexStringFilter(first_name);
    if (last_name) filterCriteria.last_name = regexStringFilter(last_name);
    if (phone) filterCriteria.phone = regexPhoneNumberFilter(phone);

    return filterCriteria;
  }

  /**
   * This function generates a downloadable url of a generated csv for leads
   */
  async exportLeadsAsCSV(leads: any[]): Promise<string | null> {
    try {
      // Format data
      const formatCSVData = (data: any[]): any[] => {
        return data.map((item) => ({
          'Lead ID': item.lead_id ?? '',
          'First Name': item.first_name ?? '',
          'Last Name': item.last_name ?? '',
          Phone: item.phone ?? '',
          'Approved By': item.approved_by ?? '',
        }));
      };

      const formattedData = formatCSVData(leads);

      // Generate url
      const downloadUrl = await this.exportService.exportAsCSV(
        formattedData,
        'lead-deny-list',
      );
      return downloadUrl;
    } catch (error) {
      new Logger().debug(
        `leads.service.ts -> exportLeadsAsCSV -> ${error}`,
        'DEBUG',
      );
      return null;
    }
  }
}
