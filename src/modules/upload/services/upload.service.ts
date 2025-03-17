import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { UploadDatabaseService } from './upload.database.service';
import { IPythonRequest, IUpload } from '@interface/upload/upload';
import { UploadStatusEnum } from '@constant/upload/upload';
import {
  IMultiPartPresignedUrlFormat,
  IPresignedUrlFormat,
} from '@interface/s3/s3';
import { S3Service } from '@common/services/s3.service';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import { ILoggedUser } from '@interface/authorization/user';

@Injectable()
export class UploadService {
  private readonly logger = new Logger(UploadService.name);
  constructor(
    private readonly uploadDatabaseService: UploadDatabaseService,
    private readonly s3Service: S3Service,
    private readonly httpService: HttpService,
  ) {}

  /**
   * Generate a presigned URL for uploading a single file.
   * Returns null if an upload job cannot be created or the URL cannot be generated.
   */
  async getPresignedUrlForSingleFile(
    fileName: string,
    key: string,
  ): Promise<IPresignedUrlFormat> {
    const upload = await this.createUpload(fileName, key);
    if (!upload) {
      this.logger.error(
        `getPresignedUrlForSingleFile | N/A | Failed to create a job for file: ${fileName}`,
      );
      return null;
    }

    try {
      const presignedUrl = await this.s3Service.generatePresignedUrl(key);
      if (!presignedUrl) {
        this.logger.error(
          `Failed to generate a presigned URL for file: ${fileName}`,
        );
        return null;
      }

      return { url: presignedUrl.url, _id: upload._id };
    } catch (error) {
      this.logger.error(`Error generating presigned URL ${error}`);
      throw error;
    }
  }

  /**
   * Mark a single file upload as complete by updating its status
   * and optionally notifying other services if needed.
   */
  async markSingleFileUploadAsComplete(id: string, key: string): Promise<void> {
    try {
      const completeResponse = await this.s3Service.markSingleUploadComplete(
        id,
        key,
      );

      if (!completeResponse) {
        this.logger.error(
          `Failed to mark file upload as complete for key: ${key}`,
        );
        return;
      }

      const updatedData = await this.updateUploadStatus(
        id,
        UploadStatusEnum.UPLOAD_COMPLETED,
      );

      if (!updatedData) {
        this.logger.error(`Failed to update status for upload ID: ${id}`);
        return;
      }

      this.logger.log(`Successfully marked upload as complete for ID: ${id}`);

      // If the upload status update is successful, trigger the Python service
      // await this.notifyPythonService(id, key);

      let requestPayload = {
        key,
        id,
        pageIndex: 0,
        pageSize: 10,
      } as IPythonRequest;

      const fileData = await this.notifyPythonService(requestPayload);

      this.logger.log(
        `Successfully notified Python service for key: ${key}, upload ID: ${id}`,
      );

      return fileData.csv_data;
    } catch (error) {
      this.logger.error('Error marking file upload as complete', error.stack);
      throw error;
    }
  }
  async notifyPythonService(requestData: IPythonRequest): Promise<any> {
    try {
      // Use lastValueFrom to convert the observable to a promise
      const pythonResponse = await lastValueFrom(
        this.httpService.get(
          `${process.env.PYTHON_HOST}/process-file?id=${requestData.id}&key=${requestData.key}&pageIndex=${requestData.pageIndex}&pageSize=${requestData.pageSize}`,
        ),
      );

      this.logger.log(
        `Successfully notified Python service for key: ${requestData.key}, upload ID: ${requestData.id}`,
      );

      return pythonResponse.data;
    } catch (error) {
      this.logger.error(
        `Failed to notify Python service for key: ${requestData.key}, upload ID: ${requestData.id}. Error: ${error.message}`,
      );
    }
  }

  /**
   * Initialize a multipart upload process for a large file.
   * Returns multipart upload details including upload ID and key.
   */
  async initializeMultipartUpload(
    fileName: string,
    key: string,
    contentType?: string,
  ): Promise<IMultiPartPresignedUrlFormat> {
    const multiPart = await this.s3Service.initializeMultipartUpload(
      key,
      contentType,
    );
    const upload = await this.createUpload(fileName, key);
    if (!upload) {
      this.logger.error(`Failed to create upload for file: ${fileName}`);
      return null;
    }
    return { _id: upload._id, upload_id: multiPart.upload_id, key };
  }

  /**
   * Generate a presigned URL for a specific part of a multipart upload.
   * Returns null if there's an error generating the URL.
   */
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

  /**
   * Complete a multipart upload by providing all parts and marking the upload as complete.
   * Logs and throws any errors encountered during the process.
   */
  async completeMultipartUpload(
    id: string,
    key: string,
    uploadId: string,
    parts: any[],
  ): Promise<void> {
    try {
      await this.s3Service.completeMultipartUpload(key, uploadId, parts);
      await this.updateUploadStatus(id, UploadStatusEnum.UPLOAD_COMPLETED);
      let requestPayload = {
        key,
        id,
        pageIndex: 0,
        pageSize: 10,
      } as IPythonRequest;

      const fileData = await this.notifyPythonService(requestPayload);

      this.logger.log(
        `Successfully notified Python service for key: ${key}, upload ID: ${id}`,
      );

      return fileData.csv_data;
    } catch (error) {
      this.logger.error('Error completing multipart upload', error.stack);
      throw error;
    }
  }

  /**
   * Internal method to create a job. No need to throw exceptions for backend operations.
   * Just log the error and handle it accordingly.
   */
  async createUpload(
    fileName: string,
    fileKey: string,
  ): Promise<IUpload | null> {
    try {
      const upload: IUpload = {
        file_name: fileName,
        original_file_name: fileName,
        status: UploadStatusEnum.URL_GENERATED,
        uploaded_at: new Date(),
        key: fileKey,
      };
      return await this.uploadDatabaseService.createUpload(upload);
    } catch (error) {
      return null;
    }
  }

  /**
   * Internal method to update the job status by ID.
   * No exceptions thrown, just logging for backend operations.
   */
  async updateUploadStatus(
    id: string,
    status: UploadStatusEnum,
  ): Promise<IUpload | null> {
    const upload = await this.uploadDatabaseService.findUploadById(id);

    if (!upload) {
      return null;
    }

    try {
      return await this.uploadDatabaseService.updateByUploadId(id, { status });
    } catch (error) {
      return null; // Handle error internally
    }
  }

  /**
   * Internal method to update the uploadedAt timestamp for a job by ID.
   */
  async updateUploadedAt(
    id: string,
    uploadedAt: Date,
  ): Promise<IUpload | null> {
    const upload = await this.uploadDatabaseService.findUploadById(id);

    if (!upload) {
      return null;
    }

    try {
      return await this.uploadDatabaseService.updateByUploadId(id, {
        created_on: uploadedAt,
      });
    } catch (error) {
      return null;
    }
  }

  /**
   * Internal method to retrieve a job by its ID.
   */
  async getJobById(id: string): Promise<IUpload | null> {
    try {
      const upload = await this.uploadDatabaseService.findUploadById(id);
      return upload;
    } catch (error) {
      return null;
    }
  }

  /**
   * Public API to get file stats for the frontend.
   * This method throws a NotFoundException if the job is not found.
   */
  async getFileStats(uploadId: string): Promise<IUpload> {
    const upload = await this.uploadDatabaseService.findUploadById(uploadId);

    if (!upload) {
      throw new NotFoundException(`Upload with ID ${uploadId} not found.`);
    }

    return upload; // Return job details, potentially including file stats
  }

  /**
   * This function sets the changed by and last modified properties of upload file and update the file with the meta data
   * @param id This parameter contains the database id of the document
   * @param addLeadFileMetaData This parameter contains the data to be updated
   * @param loggedUser this contains the logged user object
   * @returns this function returns the updated document
   */
  async addLeadFileMetaData(
    id: string,
    addLeadFileMetaData: Partial<IUpload>,
    loggedUser: ILoggedUser,
  ) {
    try {
      return await this.uploadDatabaseService.updateByUploadId(id, {
        ...addLeadFileMetaData,
        changed_by: loggedUser._id,
        last_modified_on: new Date(),
      });
    } catch (err) {
      new Logger().debug(
        `lead filter.database.service.ts -> findLeadFilterByIdAndUpdate -> ${err}`,
        'DEBUG',
      );
    }
  }
}
