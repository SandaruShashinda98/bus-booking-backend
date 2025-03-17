import { CommonFieldsDTO } from '@common/dto/common-fields.dto';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDate,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { ResolvedTypeReferenceDirectiveWithFailedLookupLocations } from 'typescript';

export class AddLeadFileMetaDataResponseDTO extends CommonFieldsDTO {
  @ApiProperty({
    example: 'large_file_10mb.csv',
    type: String,
    required: false,
  })
  @IsString()
  @IsOptional()
  original_file_name: string;

  @ApiProperty({ example: 'large_file.csv', type: String, required: false })
  @IsString()
  @IsOptional()
  file_name: string;

  @ApiProperty({ example: ',', type: String, required: false })
  @IsString()
  @IsOptional()
  csv_delimiter: string;

  @ApiProperty({ example: '"', type: String, required: false })
  @IsString()
  @IsOptional()
  csv_escape: string;

  @ApiProperty({
    example: 'true',
    description: 'first line to be ignored or not',
    type: Boolean,
    required: false,
  })
  @IsBoolean()
  ignore_first_line: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  file_status: unknown;

  @ApiProperty({ example: 3, type: Number, required: false })
  @IsNumber()
  @IsOptional()
  total_rows: number;

  @ApiProperty({ example: 3, type: Number, required: false })
  @IsNumber()
  @IsOptional()
  parsed_rows: number;

  @ApiProperty({ required: false })
  @IsOptional()
  status: unknown;

  @ApiProperty({ example: '2023-06-02T10:00:00Z', type: Date, required: false })
  @IsDate()
  @Type(() => Date)
  @IsOptional()
  uploaded_at: Date;

  @ApiProperty({ example: '"', type: String, required: true })
  @IsString()
  @IsOptional()
  hlr_lookup: string;

  @ApiProperty({ example: '"', type: String, required: true })
  @IsString()
  @IsOptional()
  assigned_to: string;

  @ApiProperty({ example: '"', type: String, required: true })
  @IsArray()
  @IsOptional()
  raw_columns: string[];

  @ApiProperty({ example: '"', type: String, required: true })
  @IsArray()
  @IsOptional()
  new_columns: string[];
}
