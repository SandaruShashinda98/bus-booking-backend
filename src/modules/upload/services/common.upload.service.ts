import { S3Service } from '@common/services/s3.service';
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class CommonUploadService {
  private readonly logger = new Logger(CommonUploadService.name);
  constructor(private readonly s3Service: S3Service) {}

  async initializeMultiPartUpload(key: string, file_type: string) {
    const multiPart = await this.s3Service.initializeMultipartUpload(
      key,
      file_type,
    );

    return { upload_id: multiPart.upload_id };
  }

  async getPresignedUrlForPart(
    key: string,
    uploadId: string,
    partNumber: number,
  ): Promise<string | null> {
    try {
      return await this.s3Service.getPresignedUrlForPart(
        key,
        uploadId,
        partNumber,
      );
    } catch (error) {
      this.logger.error('Error generating presigned URL for part', error.stack);
      throw error;
    }
  }
  async getPresignedUrlForSingleFile(fileName: string, key: string) {
    try {
      const presignedUrl = await this.s3Service.generatePresignedUrl(key);
      if (!presignedUrl) {
        this.logger.error(
          `Failed to generate a presigned URL for file: ${fileName}`,
        );
        return null;
      }

      return presignedUrl.url;
    } catch (error) {
      this.logger.error(`Error generating presigned URL ${error}`);
      throw error;
    }
  }
}
