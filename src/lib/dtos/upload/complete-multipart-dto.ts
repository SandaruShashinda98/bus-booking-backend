import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsString } from 'class-validator';

export class CompleteMultipartUploadDto {
  @ApiProperty({
    description:
      'The key (file name) of the multipart upload in the S3 bucket.',
    example: '1609459200000-file.txt',
  })
  @IsString()
  key: string;

  @ApiProperty({
    description: 'The job ID of the multipart upload session.',
    example: '60a4c9f2d0d3e1f7e9d1a0d3',
  })
  @IsString()
  _id: string;

  @ApiProperty({
    description: 'The upload ID of the multipart upload session.',
    example: 'exampleUploadId123456789',
  })
  @IsString()
  upload_id: string;

  @ApiProperty({
    description:
      'Array of parts that have been uploaded. Each part contains the ETag and PartNumber.',
    example: [
      { ETag: '"80c485b74036e1c6cbb33a04b7b96ddd"', PartNumber: 1 },
      { ETag: '"499f6c3e6c53de2bba47d4b9dccb04e3"', PartNumber: 2 },
    ],
  })
  @IsArray()
  parts: { ETag: string; PartNumber: number }[];
}
