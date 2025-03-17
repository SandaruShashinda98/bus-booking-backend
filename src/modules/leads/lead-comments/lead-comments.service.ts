import { ExportService } from '@common/services/export.service';
import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { FilterQuery } from 'mongoose';

@Injectable()
export class LeadCommentsService {
  constructor(private readonly exportService: ExportService) {}

  /**
   * This function generates filter criteria based on request body filters
   */
  getLeadCommentFilters(queryParams: any) {
    const { searchKey, upload_date_start, upload_date_end, comment, lead_id } =
      queryParams;

    const filterCriteria: FilterQuery<any> = {};

    if (searchKey)
      filterCriteria.comment = {
        $regex: searchKey.toString().trim(),
        $options: 'i',
      };

    if (comment)
      filterCriteria.comment = {
        $regex: comment.toString().trim(),
        $options: 'i',
      };

    if (lead_id) filterCriteria.lead_id = lead_id;

    // Handle date filtering
    if (upload_date_start || upload_date_end) {
      if (upload_date_start && upload_date_end) {
        const startDate = new Date(upload_date_start);
        const endDate = new Date(upload_date_end);

        if (startDate > endDate) {
          throw new BadRequestException('Start date must be before end date');
        }

        filterCriteria.$and = [
          { created_on: { $gte: startDate } },
          { created_on: { $lte: endDate } },
        ];
      } else if (upload_date_start) {
        filterCriteria.created_on = { $gte: new Date(upload_date_start) };
      } else if (upload_date_end) {
        filterCriteria.created_on = { $lte: new Date(upload_date_end) };
      }
    }

    return filterCriteria;
  }

  /**
   * This function generates a downloadable url of a generated csv for comments
   */
  async exportCommentsAsCSV(comments: any[]): Promise<string | null> {
    try {
      // Format data
      const formatCSVData = (data: any[]): any[] => {
        return data.map((item) => ({
          Campaign: 'P1+',
          'Campaign Lead ID': '426865',
          User: item.creator_name ?? '',
          Date: new Date(item.created_on).toISOString().split('T')[0],
          Comment: item.comment ?? '',
        }));
      };

      const formattedData = formatCSVData(comments);

      // Generate url
      const downloadUrl = await this.exportService.exportAsCSV(
        formattedData,
        `Comments-Lead-${comments[0]?.lead_id ?? '1234'}-${new Date().toISOString().split('T')[0]}.csv`,
      );
      return downloadUrl;
    } catch (error) {
      new Logger().debug(
        `leads.service.ts -> exportToCSV -> ${error}`,
        'DEBUG',
      );
      return null;
    }
  }
}
