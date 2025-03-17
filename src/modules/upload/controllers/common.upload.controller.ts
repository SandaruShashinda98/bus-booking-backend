import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Logger,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CommonUploadService } from '../services/common.upload.service';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { InitializeDenyListMultiPartUploadDto } from '@dto/upload/common.upload.request.dto';
import { generateUploadKey } from '@common/helpers/common.upload.helper';
import { LogRequest } from '@common/decorators/log-request-response.decorator';

@ApiTags('common-uploads')
@Controller({ path: 'uploads' })
export class CommonUploadController {
  constructor(private readonly commonUploadService: CommonUploadService) {}

  @ApiOperation({
    summary: 'Get presigned URL for single upload',
  })
  @UseGuards(JwtAuthGuard)
  @Get('single-upload-init/:directory')
  @LogRequest('common-uploads -> getSingleUploadPresignedUrl')
  async getSingleUploadPresignedUrl(
    @Query('fileName') fileName: string,
    @Param('directory') directory: string,
  ) {
    //throw errors if no file name
    if (!fileName)
      throw new BadRequestException('Missing fileName query param');

    try {
      const key = generateUploadKey(directory, fileName);

      //get presigned url
      const presignedUrl =
        await this.commonUploadService.getPresignedUrlForSingleFile(
          fileName,
          key,
        );

      //throw error if the process failed
      if (!presignedUrl)
        throw new BadRequestException('Failed to get presigned URL');

      return {
        url: presignedUrl,
        key,
      };
    } catch (error) {
      new Logger().error(`Failed to get presigned URL ${error}`);
      throw new BadRequestException('Failed to get presigned URL');
    }
  }

  @ApiOperation({
    summary: 'Initialize deny list upload',
  })
  @UseGuards(JwtAuthGuard)
  @Post('multipart-init')
  @LogRequest('common-uploads -> initializeMultiPartUpload')
  async initializeMultiPartUpload(
    @Body() requestBody: InitializeDenyListMultiPartUploadDto,
  ) {
    const { file_name, file_type, directory } = requestBody;

    if (!file_name)
      throw new BadRequestException('Failed to initialize multipart upload');

    try {
      const key = generateUploadKey(directory, file_name);

      //create an upload id to upload the file
      const initializedData =
        await this.commonUploadService.initializeMultiPartUpload(
          key,
          file_type,
        );

      if (!initializedData)
        throw new Error('Failed to initialize multipart upload');

      return { key, upload_id: initializedData.upload_id };
    } catch (error) {
      new Logger().error(`Failed to create multipart upload ${error}`);
      throw new BadRequestException('Failed to create multipart upload');
    }
  }

  @ApiOperation({ summary: 'Get presigned urls' })
  @UseGuards(JwtAuthGuard)
  @Post('multipart-presigned-url')
  @LogRequest('common-uploads -> getPresignedUrlsForParts')
  async getPresignedUrlsForParts(@Body() requestBody: any) {
    const { key, upload_id, part_numbers } = requestBody;

    //check content existence
    if (
      !key ||
      !upload_id ||
      !part_numbers ||
      !Array.isArray(part_numbers) ||
      !part_numbers.length
    )
      throw new BadRequestException('Invalid Request Parameters');

    try {
      const presignedUrls = await Promise.all(
        part_numbers.map(async (partNumber) => {
          const url = await this.commonUploadService.getPresignedUrlForPart(
            key,
            upload_id,
            partNumber,
          );
          return { part_number: partNumber, url };
        }),
      );

      if (!presignedUrls)
        throw new BadRequestException('Failed to get presigned Urls');

      return presignedUrls;
    } catch (error) {
      new Logger().error(`Failed to get presigned URLs for parts ${error}`);
      throw new BadRequestException('Failed to get presigned URLs for parts');
    }
  }
}
