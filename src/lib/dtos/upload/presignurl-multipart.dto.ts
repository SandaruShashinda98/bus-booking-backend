import { IsArray, IsString, ArrayNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GetPresignedUrlsForPartsDto {
  @ApiProperty({
    description:
      'The key (file name) of the multipart upload in the S3 bucket.',
    example: '1609459200000-file.txt',
  })
  @IsString()
  key: string;

  @ApiProperty({
    description: 'The upload ID of the multipart upload session.',
    example: 'exampleUploadId123456789',
  })
  @IsString()
  upload_id: string;

  @ApiProperty({
    description:
      'An array of part numbers for which to generate presigned URLs.',
    example: [1, 2, 3],
  })
  @IsArray()
  @ArrayNotEmpty()
  part_numbers: number[];
}
