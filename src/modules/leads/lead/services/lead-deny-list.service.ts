import { S3Service } from '@common/services/s3.service';
import StreamService from '@common/services/stream.service';
import { LEAD_DENY_STATUS } from '@constant/leads/leads';
import { DenyStatusChangeDto } from '@dto/leads/lead-deny-list.request.dto';
import { Injectable } from '@nestjs/common';
import { PassThrough } from 'stream';
import { LeadService } from './leads.service';
import { getCSVFirstColumnFromString } from '@common/helpers/export.helper';

@Injectable()
export class LeadDenyListService {
  constructor(
    private readonly streamService: StreamService,
    private readonly s3Service: S3Service,
    private readonly leadService: LeadService,
  ) {}

  /**
   * The following function converts a buffer stream into a large string
   * @param fileStream is a file stream
   * @returns a string containing the values of the stream
   */
  async getBufferToStream(fileStream: PassThrough): Promise<string> {
    const [err, result] = await this.streamService.bufferToStream(fileStream);

    if (err || !result)
      throw new Error(`Error Occurred while file processing ${err}`);

    return result;
  }

  /**
   * The following function extract the meaningful information from a file
   * @param key contains the key of the stored file
   * @returns a list of phone numbers as a string array
   */
  async getFileContent(key: string): Promise<string[]> {
    const downloadedBuffer = await this.s3Service.downloadFile(key);
    const downloadedStream = await this.getBufferToStream(downloadedBuffer);

    return getCSVFirstColumnFromString(downloadedStream);
  }

  /**
   * This function filters phone numbers which are included in the database
   * @param phoneNumbers includes the numbers to be included in the database
   * @param duplicatePhoneNumbers the duplicate phone numbers or phone numbers that already exists in the database
   * @returns returns an array of phone numbers or strings that already exists
   */
  filterUniquePhoneNumbers(
    phoneNumbers: string[],
    duplicatePhoneNumbers: string[],
  ) {
    const existingNumbersSet = new Set(duplicatePhoneNumbers);

    return phoneNumbers.filter(
      (phoneNumber) => !existingNumbersSet.has(phoneNumber),
    );
  }

  /**
   * This function returns a javascript object that suits the document structs to be inserted and filters the duplicates
   * @param phoneNumbers is the total phone numbers extracted from the file
   * @param preApproved is the status of whether the phone numbers are preapprove or not
   * @param duplicatePhoneNumbers is the list of duplicate numbers which already exists in the database
   * @returns an array of objects that is suitable for a bulk insert
   */
  createInsertDocument(
    phoneNumbers: string[],
    duplicatePhoneNumbers: string[],
    preApproved: boolean,
  ): { phone: string; deny_status: string }[] {
    const uniquePhoneNumbers = this.filterUniquePhoneNumbers(
      phoneNumbers,
      duplicatePhoneNumbers,
    );

    return uniquePhoneNumbers.map((phoneNumber) => ({
      phone: phoneNumber,
      deny_status: preApproved
        ? LEAD_DENY_STATUS.DENIED
        : LEAD_DENY_STATUS.PENDING_DENY,
    }));
  }

  /**
   * This function completes the multi part upload by combing the file together
   * @param key is the key of the file
   * @param uploadId is the uploadId of the file
   * @param parts is the parts array which contains the etag and part number
   */
  async completeMultiPartUpload(
    key: string,
    uploadId: string,
    parts: { ETag: string; PartNumber: number }[],
  ) {
    await this.s3Service.completeMultipartUpload(key, uploadId, parts);
  }

  /**
   * The following function determines the correct filter for the deny status update process
   * @param denyStatusChangeDto object contains the parameters such as selected_ids, is_all and filter
   * which the filter depends on
   * @returns a filter suited for a updateMany operation to update the deny status
   */
  getUpdateFilterForDenyStatusModify(denyStatusChangeDto: DenyStatusChangeDto) {
    if (denyStatusChangeDto.selected_ids?.length) {
      return { _id: { $in: denyStatusChangeDto.selected_ids } };
    } else if (denyStatusChangeDto.is_all) {
      return {
        deny_status: denyStatusChangeDto.current_status,
        is_delete: false,
      };
    } else if (!denyStatusChangeDto.is_all && denyStatusChangeDto.filter) {
      return this.leadService.getLeadDenyListFilters(
        denyStatusChangeDto.filter,
        denyStatusChangeDto.current_status === LEAD_DENY_STATUS.PENDING_DENY,
      );
    } else {
      return { _id: { $in: [] } };
    }
  }
}
