import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class AddLeadFileMetaDataDTO {
  @ApiProperty({
    example: 'large_csv_file_10mb.csv',
    type: String,
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  original_file_name: string;

  @ApiProperty({ example: 'large_csv_file.csv', type: String, required: true })
  @IsString()
  @IsNotEmpty()
  file_name: string;

  @ApiProperty({ example: ',', type: String, required: true })
  @IsString()
  @IsOptional()
  csv_delimiter: string;

  @ApiProperty({ example: '"', type: String, required: true })
  @IsString()
  @IsOptional()
  csv_escape: string;

  @ApiProperty({
    example: 'true',
    description: 'first line to be ignored or not',
    type: Boolean,
    required: true,
  })
  @IsBoolean()
  ignore_first_line: boolean;
}
