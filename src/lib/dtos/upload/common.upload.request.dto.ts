import { UPLOAD_DIRECTORIES } from '@constant/upload/common.upload';
import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class InitializeDenyListMultiPartUploadDto {
  @ApiProperty({
    description: 'The name of the file to be uploaded.',
    example: 'file.txt',
  })
  @IsString()
  file_name: string;

  @ApiProperty({
    description: 'The type of the file (MIME type). This field is optional.',
    example: 'text/plain',
    required: false,
  })
  @IsOptional()
  @IsString()
  file_type?: string;

  @ApiProperty({
    description: 'The directory which the file should be added',
    example: 'lead_files',
    required: true,
  })
  @IsString()
  directory: UPLOAD_DIRECTORIES;
}
