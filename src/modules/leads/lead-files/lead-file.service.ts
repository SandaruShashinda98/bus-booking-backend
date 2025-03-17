import {
  convertEnumToDisplay,
  convertToSnakeCase,
} from '@common/helpers/enum.helper';
import { LEAD_COLUMN_TYPE } from '@constant/leads/leads';
import { HttpService } from '@nestjs/axios';
import { BadRequestException, Injectable } from '@nestjs/common';
import { lastValueFrom } from 'rxjs';
import { addCountryData } from '@common/helpers/country.helper';
import { IUpload } from '@interface/upload/upload';
import { FilterQuery } from 'mongoose';

@Injectable()
export class LeadFileService {
  constructor(private readonly httpService: HttpService) {}

  // This function generates filter criteria based on search key and ID for lead filters
  getLeadFileFilters(queryParams: any) {
    const {
      searchKey,
      file_name,
      upload_date_start,
      upload_date_end,
      file_status,
    } = queryParams;

    const filterCriteria: FilterQuery<any> = {
      is_delete: false,
    };

    // Handle search key
    if (searchKey)
      filterCriteria.file_name = { $regex: searchKey?.trim(), $options: 'i' };

    // Handle file status
    if (file_status) filterCriteria.file_status = file_status;

    // Handle specific file name
    if (file_name)
      filterCriteria.file_name = { $regex: file_name?.trim(), $options: 'i' };

    // Handle date filtering
    if (upload_date_start || upload_date_end) {
      if (upload_date_start && upload_date_end) {
        const startDate = new Date(upload_date_start);
        const endDate = new Date(upload_date_end);

        if (startDate > endDate) {
          throw new BadRequestException('Start date must be before end date');
        }

        filterCriteria.$and = [
          { uploaded_at: { $gte: startDate } },
          { uploaded_at: { $lte: endDate } },
        ];
      } else if (upload_date_start) {
        filterCriteria.uploaded_at = { $gte: new Date(upload_date_start) };
      } else if (upload_date_end) {
        filterCriteria.uploaded_at = { $lte: new Date(upload_date_end) };
      }
    }

    return filterCriteria;
  }

  // Get enum values and convert them dynamically to display-friendly format
  getLeadColumnTypes(): { key: string; value: string }[] {
    return Object.keys(LEAD_COLUMN_TYPE).map((key) => {
      const enumValue = LEAD_COLUMN_TYPE[key];
      return {
        key: enumValue,
        value: convertEnumToDisplay(enumValue),
      };
    });
  }

  // Process the fields in the request body
  async importFileData(uploadId: string, key: string, fields: string[]) {
    const columns = fields.map((fieldLabel) => convertToSnakeCase(fieldLabel));

    const data = {
      columns,
      uploadId,
      key,
    };

    try {
      lastValueFrom(
        this.httpService.post(`${process.env.PYTHON_HOST}/import-data`, {
          data,
        }),
      );

      return {
        message: 'Data importing in-progress',
        success: true,
      };
    } catch (error) {
      console.error('Error sending data to Python processor:', error.message);
    }
  }

  //The Following function adds the country data (ex:image) to the selected lead file
  addCountryDataToLeadFile(leadFileData: IUpload) {
    return addCountryData(leadFileData);
  }
}
