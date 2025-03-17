import { generateCSV } from '@common/helpers/export.helper';
import { S3Service } from './s3.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ExportService {
  constructor(private readonly s3Service: S3Service) {}

  async exportAsCSV(
    formattedData: any[],
    file_name: string,
  ): Promise<string | any> {
    // Generate CSV buffer from formatted data
    const csvBuffer = await generateCSV(formattedData);

    // Generate unique filename with timestamp
    const fileName = `${file_name}-${Date.now()}.csv`;

    // Upload to S3 and get signed URL
    const downloadUrl = await this.s3Service.uploadCSVAndGetUrl(
      csvBuffer,
      fileName,
    );

    return downloadUrl;
  }
}
