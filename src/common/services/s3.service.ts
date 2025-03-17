import { Injectable, Logger } from '@nestjs/common';
import {
  S3Client,
  ListObjectsV2Command,
  PutObjectCommand,
  CreateMultipartUploadCommand,
  UploadPartCommand,
  CompleteMultipartUploadCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { IMultiPartPresignedUrlFormat } from '@interface/s3/s3';
import { PassThrough, Readable } from 'stream';

@Injectable()
export class S3Service {
  private readonly s3Client: S3Client;
  private readonly bucketName: string;

  constructor() {
    const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
    const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
    const region = process.env.AWS_REGION;
    const bucketName = process.env.AWS_S3_BUCKET_NAME;

    if (!accessKeyId || !secretAccessKey || !region || !bucketName) {
      new Logger().error('Missing necessary AWS environment variables');
      throw new Error('Missing necessary AWS environment variables');
    }

    this.s3Client = new S3Client({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: accessKeyId,
        secretAccessKey: secretAccessKey,
      },
    });
    this.bucketName = process.env.AWS_S3_BUCKET_NAME!;
  }

  async listFiles() {
    const command = new ListObjectsV2Command({
      Bucket: this.bucketName,
    });

    try {
      const response = await this.s3Client.send(command);
      return response.Contents;
    } catch (error) {
      new Logger().error(error);
      throw error;
    }
  }

  // Method to generate presigned URL for single upload (from previous step)
  async generatePresignedUrl(
    key: string,
    expiresIn: number = 3600,
  ): Promise<any> {
    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: key,
    });
    try {
      const url = await getSignedUrl(this.s3Client, command, { expiresIn });
      return { url };
    } catch (error) {
      new Logger().error(error);
      throw error;
    }
  }

  async markSingleUploadComplete(uploadId: string, key: string): Promise<any> {
    const command = new ListObjectsV2Command({
      Bucket: this.bucketName,
      Prefix: key,
    });

    try {
      const response = await this.s3Client.send(command);
      const fileExists = response.Contents?.some((file) => file.Key === key);

      if (!fileExists) {
        throw new Error('File not found in S3');
      }
      return response;
    } catch (error) {
      new Logger().error(error);
      throw error;
    }
  }

  // 1. Initialize Multipart Upload
  async initializeMultipartUpload(
    key: string,
    contentType?: string,
  ): Promise<IMultiPartPresignedUrlFormat> {
    const command = new CreateMultipartUploadCommand({
      Bucket: this.bucketName,
      Key: key,
      ContentType: contentType,
    });

    try {
      const response = await this.s3Client.send(command);
      return { upload_id: response.UploadId };
    } catch (error) {
      new Logger().error(error);
      throw error;
    }
  }

  // 2. Generate Presigned URL for a Part
  async getPresignedUrlForPart(
    key: string,
    uploadId: string,
    partNumber: number,
    expiresIn: number = 3600,
  ): Promise<string> {
    const command = new UploadPartCommand({
      Bucket: this.bucketName,
      Key: key,
      UploadId: uploadId,
      PartNumber: partNumber,
    });

    try {
      const url = await getSignedUrl(this.s3Client, command, { expiresIn });
      return url;
    } catch (error) {
      new Logger().error(error);
      throw error;
    }
  }

  // 3. Complete Multipart Upload
  async completeMultipartUpload(
    key: string,
    uploadId: string,
    parts: { ETag: string; PartNumber: number }[],
  ): Promise<void> {
    const sortedParts = [...parts].sort((a, b) => a.PartNumber - b.PartNumber);

    const command = new CompleteMultipartUploadCommand({
      Bucket: this.bucketName,
      Key: key,
      UploadId: uploadId,
      MultipartUpload: {
        Parts: sortedParts,
      },
    });

    try {
      await this.s3Client.send(command);

      // await this.uploadService.updateUploadStatus(
      //   id,
      //   UploadStatusEnum.UPLOAD_COMPLETED,
      // );

      // // Call Python Flask API to process the file using lastValueFrom to resolve the Observable
      // const response = await lastValueFrom(
      //   this.httpService.post(`${process.env.PYTHON_HOST}/process-file`, {
      //     key,
      //     _id: uploadId,
      //   }),
      // );
    } catch (error) {
      new Logger().error(error);
      throw error;
    }
  }

  //   // 4. Abort Multipart Upload (Optional)
  //   async abortMultipartUpload(key: string, uploadId: string): Promise<void> {
  //     const command = new AbortMultipartUploadCommand({
  //       Bucket: this.bucketName,
  //       Key: key,
  //       UploadId: uploadId,
  //     });

  //     try {
  //       await this.s3Client.send(command);
  //     } catch (error) {
  //       new Logger().error(error);
  //       throw error;
  //     }
  //   }

  async uploadCSVAndGetUrl(
    buffer: Buffer,
    fileName: string,
    expiresIn: number = 3600,
  ): Promise<string> {
    const key = `exports/${fileName}`;

    const uploadCommand = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: key,
      Body: buffer,
      ContentType: 'text/csv',
      ContentDisposition: 'attachment',
    });

    try {
      // Upload the file
      await this.s3Client.send(uploadCommand);

      // Generate download URL
      const getCommand = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      const downloadUrl = await getSignedUrl(this.s3Client, getCommand, {
        expiresIn,
      });

      return downloadUrl;
    } catch (error) {
      new Logger().error('Error in uploadCSVAndGetUrl:', error);
      throw error;
    }
  }

  /**
   * This function includes the functionality of downloading a file based on the key
   * @param key Is the key/filename/filename with path in the bucket
   * @returns This function returns a buffer
   */
  async downloadFile(key: string): Promise<PassThrough> {
    const getCommand = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: key,
    });

    try {
      const { Body } = await this.s3Client.send(getCommand);

      if (!Body || !(Body instanceof Readable)) {
        throw new Error('No readable stream returned from S3');
      }

      const passThrough = new PassThrough();
      Body.pipe(passThrough);
      return passThrough;
    } catch (error) {
      console.error('Error while downloading file:', error);
      throw new Error(`Failed to download file from S3: ${error.message}`);
    }
  }
  
  async getFileInFolder(
    folderPath: string,
    fileName: string,
    expiresIn: number = 9600,
  ): Promise<{ name: string; url: string }> {
    const fileKey = `${folderPath}/${fileName}`;

    const getCommand = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: fileKey,
    });

    try {
      const url = await getSignedUrl(this.s3Client, getCommand, { expiresIn });

      return {
        url,
        name: fileName,
      };
    } catch (error) {
      new Logger().error(`s3.service.ts -> getFileInFolder -> ${error}`, error);
      throw new Error(`Failed to retrieve file: ${fileName}`);
    }
  }
}
