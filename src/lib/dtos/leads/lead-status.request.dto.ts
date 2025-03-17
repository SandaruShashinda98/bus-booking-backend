import { CommonEditFieldsRequestDTO } from '@common/dto/common-fields.dto';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsArray, IsMongoId, IsOptional, IsString } from 'class-validator';
import { Types } from 'mongoose';

export class LeadStatusDto {
  @ApiProperty({ example: 'Status Name', type: String, required: true })
  @IsString()
  name: string;

  @ApiProperty({ example: 'Status description', type: String, required: true })
  @IsString()
  @IsOptional()
  description: string;

  @ApiProperty({ example: 'red', type: String, required: true })
  @IsString()
  background_color: string;

  @ApiProperty({ example: 'white', type: String, required: true })
  @IsString()
  text_color: string;

  @ApiProperty({ example: 'New Requirement', type: [String], required: true })
  @IsArray()
  @IsString({ each: true })
  feedback_requirements: string[];

  @ApiProperty({ example: 'Status workflow', type: [String], required: true })
  @IsArray()
  @IsString({ each: true })
  status_workflow: string[];

  @ApiProperty({ example: 'New API', type: String, required: true })
  @IsString()
  api_mapping: string;

  @ApiProperty({
    description: 'The ObjectId of the voice mail button status',
    type: String,
    example: '507f191e810c19729de860ea',
    required: false,
  })
  @IsOptional()
  @IsMongoId({
    message: 'voice_mail_button_status must be a valid MongoDB ObjectId',
  })
  @Transform(({ value }) =>
    value === '' || value === null ? undefined : value,
  )
  campaign_id: Types.ObjectId;
}

export class UpdateLeadStatusDto extends CommonEditFieldsRequestDTO {
  @ApiProperty({ example: 'Status Name', type: String, required: false })
  @IsOptional()
  @IsString()
  name: string;

  @ApiProperty({ example: 'Status description', type: String, required: false })
  @IsString()
  @IsOptional()
  description: string;

  @ApiProperty({ example: 'red', type: String, required: false })
  @IsOptional()
  @IsString()
  background_color: string;

  @ApiProperty({ example: 'white', type: String, required: false })
  @IsOptional()
  @IsString()
  text_color: string;

  @ApiProperty({ example: 'New Requirement', type: [String], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  feedback_requirements: string[];

  @ApiProperty({ example: 'Status workflow', type: [String], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  status_workflow: string[];

  @ApiProperty({ example: 'New API', type: String, required: true })
  @IsOptional()
  @IsString()
  api_mapping: string;

  @ApiProperty({
    description: 'The ObjectId of the voice mail button status',
    type: String,
    example: '507f191e810c19729de860ea',
    required: false,
  })
  @IsOptional()
  @IsMongoId({
    message: 'voice_mail_button_status must be a valid MongoDB ObjectId',
  })
  @Transform(({ value }) =>
    value === '' || value === null ? undefined : value,
  )
  campaign_id: Types.ObjectId;
}
