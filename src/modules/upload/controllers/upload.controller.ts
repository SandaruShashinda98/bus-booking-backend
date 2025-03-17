import {
  BadRequestException,
  Body,
  Controller,
  Get,
  InternalServerErrorException,
  Logger,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { InitializeMultipartUploadDto } from '@dto/upload/initialize-multipart-dto';
import { CompleteMultipartUploadDto } from '@dto/upload/complete-multipart-dto';
import { GetPresignedUrlsForPartsDto } from '@dto/upload/presignurl-multipart.dto';
import { UploadService } from '../services/upload.service';
import { S3Service } from '@common/services/s3.service';
import { IPythonRequest } from '@interface/upload/upload';
import { LogRequest } from '@common/decorators/log-request-response.decorator';
import { ILoggedUser } from '@interface/authorization/user';
import { ObjectIDPathDTO } from '@common/dto/object-id.path.dto';
import { AddLeadFileMetaDataDTO } from '@dto/upload/upload-request.dto';
import { RESPONSE_MESSAGES } from '@constant/common/responses';
import { AddLeadFileMetaDataResponseDTO } from '@dto/upload/upload-response.dto';
import { LoggedUser } from '@common/decorators/logged-user.decorator';
import { generateUploadKey } from '@common/helpers/common.upload.helper';

@ApiTags('File Upload')
@Controller({ path: 'file-upload' })
export class FileUploadController {
  constructor(
    private readonly uploadService: UploadService,
    private readonly s3Service: S3Service,
  ) {}

  @ApiOperation({
    summary: 'Get list of files in S3 bucket',
  })
  @Get('list-files')
  @UseGuards(JwtAuthGuard)
  async listFiles() {
    try {
      const files = await this.s3Service.listFiles();
      return files;
    } catch (error) {
      new Logger().error(error);
      throw error;
    }
  }

  @ApiOperation({
    summary: 'Get presigned URL for single upload',
  })
  @UseGuards(JwtAuthGuard)
  @Get('presigned-url/:directory')
  @LogRequest('file-upload -> getPresignedUrl')
  async getPresignedUrl(
    @Query('fileName') fileName: string,
    @Param('directory') directory: string,
  ) {
    if (!fileName) {
      throw new BadRequestException('Missing fileName query parameter');
    }

    try {
      const key = generateUploadKey(directory, fileName);
      const presignedUrl =
        await this.uploadService.getPresignedUrlForSingleFile(fileName, key);

      if (!presignedUrl) {
        throw new BadRequestException('Failed to get presigned URL');
      }

      return {
        url: presignedUrl.url,
        _id: presignedUrl._id,
        key,
      };
    } catch (error) {
      new Logger().error(`Failed to get presigned URL ${error}`);
      throw new BadRequestException('Failed to get presigned URL');
    }
  }

  @ApiOperation({ summary: 'Mark single file upload as complete' })
  @UseGuards(JwtAuthGuard)
  @Post('single-upload/complete')
  @LogRequest('file-upload -> completeSingleUpload')
  async completeSingleUpload(@Body() body: { key: string; _id: string }) {
    const { key, _id } = body;

    if (!key) {
      throw new BadRequestException('Missing required parameters: key or _id');
    }

    try {
      const fileResponse =
        await this.uploadService.markSingleFileUploadAsComplete(_id, key);
      return {
        message: 'Single file upload completed successfully',
        fileResponse,
      };
    } catch (error) {
      new Logger().error(`Failed to complete single upload ${error}`);
      throw new BadRequestException('Failed to complete single upload');
    }
  }

  @ApiOperation({ summary: 'Initialize multipart upload' })
  @UseGuards(JwtAuthGuard)
  @Post('multipart/init')
  @LogRequest('file-upload -> initializeMultipartUpload')
  async initializeMultipartUpload(@Body() body: InitializeMultipartUploadDto) {
    const { file_name, file_type, directory } = body;

    if (!file_name) {
      throw new BadRequestException('fileName is required');
    }

    try {
      const key = generateUploadKey(directory, file_name);
      const initializedData =
        await this.uploadService.initializeMultipartUpload(
          file_name,
          key,
          file_type,
        );
      if (!initializedData) {
        throw new BadRequestException('Failed to initialize multipart upload');
      }

      return {
        key,
        _id: initializedData._id,
        upload_id: initializedData.upload_id,
      };
    } catch (error) {
      new Logger().error(`Failed to initialize multipart upload ${error}`);
      throw new BadRequestException('Failed to initialize multipart upload');
    }
  }

  @ApiOperation({ summary: 'Get presigned URLs for parts' })
  @UseGuards(JwtAuthGuard)
  @Post('multipart/presigned-url')
  @LogRequest('file-upload -> getPresignedUrlsForParts')
  async getPresignedUrlsForParts(@Body() body: GetPresignedUrlsForPartsDto) {
    const { key, upload_id, part_numbers } = body;

    if (!key || !upload_id || !part_numbers || !Array.isArray(part_numbers)) {
      throw new BadRequestException('Invalid request parameters');
    }

    try {
      const presignedUrls = await Promise.all(
        part_numbers.map(async (partNumber) => {
          const url = await this.uploadService.getPresignedUrlForPart(
            key,
            upload_id,
            partNumber,
          );
          return { part_number: partNumber, url };
        }),
      );

      if (!presignedUrls) {
        throw new BadRequestException('Failed to get presigned URLs for parts');
      }

      return presignedUrls;
    } catch (error) {
      new Logger().error(`Failed to get presigned URLs for parts ${error}`);
      throw new BadRequestException('Failed to get presigned URLs for parts');
    }
  }

  @ApiOperation({ summary: 'Complete multipart upload' })
  @UseGuards(JwtAuthGuard)
  @Post('multipart/complete')
  @LogRequest('file-upload -> completeMultipartUpload')
  async completeMultipartUpload(@Body() body: CompleteMultipartUploadDto) {
    const { key, upload_id, parts, _id } = body;

    if (!key || !upload_id || !parts || !Array.isArray(parts)) {
      throw new BadRequestException('Invalid request parameters');
    }

    try {
      const fileResponse = await this.uploadService.completeMultipartUpload(
        _id,
        key,
        upload_id,
        parts,
      );
      return {
        message: 'File upload completed successfully',
        fileResponse,
      };
    } catch (error) {
      new Logger().error(` Failed to complete multipart upload ${error}`);
      throw new BadRequestException('Failed to complete multipart upload');
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('get-paginated-data')
  async getPaginatedData(
    @Query('_id') id: string,
    @Query('key') key: string,
    @Query('pageIndex') pageIndex: number = 0,
    @Query('pageSize') pageSize: number = 10,
  ) {
    if (!id) {
      throw new BadRequestException('Missing fileId query parameter');
    }

    try {
      const payload: IPythonRequest = {
        id,
        key,
        pageIndex,
        pageSize,
      };

      const pythonResponse =
        await this.uploadService.notifyPythonService(payload);

      if (!pythonResponse) {
        throw new BadRequestException(
          'Failed to retrieve paginated data from Python service',
        );
      }

      return pythonResponse;
    } catch (error) {
      new Logger().error(`Failed to get paginated data ${error.message}`);
      throw new BadRequestException('Failed to get paginated data');
    }
  }

  @ApiOperation({ summary: 'Add lead file upload metadata' })
  @ApiResponse({ type: AddLeadFileMetaDataResponseDTO })
  @UseGuards(JwtAuthGuard)
  @LogRequest('file-upload -> addLeadFileUpload')
  @Patch(':id')
  async addLeadFileUploadData(
    @Body() addLeadFileMetaData: AddLeadFileMetaDataDTO,
    @LoggedUser() LoggedUser: ILoggedUser,
    @Param() pathParams: ObjectIDPathDTO,
  ) {
    try {
      //update file if exists or throw an error
      const updatedFileUpload = await this.uploadService.addLeadFileMetaData(
        pathParams.id,
        addLeadFileMetaData,
        LoggedUser,
      );

      //return the entire file data

      return { data: updatedFileUpload };
    } catch (err) {
      throw new InternalServerErrorException([RESPONSE_MESSAGES.DB_FAILURE]);
    }
  }
}
