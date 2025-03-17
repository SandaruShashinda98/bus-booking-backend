import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsOptional, IsString, IsArray, IsEmail, IsBoolean } from 'class-validator';

export class LeadDetailsEditLeadRequestDTO {
  @ApiProperty({ example: 'Jonathan', type: String, required: false })
  @IsString()
  @IsOptional()
  first_name?: string;

  @ApiProperty({ example: 'Doe', type: String, required: false })
  @IsString()
  @IsOptional()
  last_name?: string;

  @ApiProperty({ example: '+123456789', type: String, required: false })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({ example: '+1123456789', type: String, required: false })
  @IsString()
  @IsOptional()
  phone_number_normalized?: string;

  @ApiProperty({ example: '+1987654321', type: String, required: false })
  @IsString()
  @IsOptional()
  secondary_phone?: string;

  @ApiProperty({ example: 'example@gmail.com', type: String, required: false })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({ example: '25', type: String, required: false })
  @IsString()
  @IsOptional()
  age?: string;

  @ApiProperty({ example: "Bachelor's Degree", type: String, required: false })
  @IsString()
  @IsOptional()
  education?: string;

  @ApiProperty({ example: 'USA', type: String, required: false })
  @IsString()
  @IsOptional()
  country?: string;

  @ApiProperty({ example: 'California', type: String, required: false })
  @IsString()
  @IsOptional()
  state?: string;

  @ApiProperty({ example: 'Los Angeles', type: String, required: false })
  @IsString()
  @IsOptional()
  city?: string;

  @ApiProperty({ example: '123 Main Street', type: String, required: false })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiProperty({ example: 'PST', type: String, required: false })
  @IsString()
  @IsOptional()
  timezone?: string;

  @ApiProperty({
    example: ['custom_field_1', 'custom_field_2'],
    type: [String],
    required: false,
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  custom?: string[];
}

export class GetLeadInformationQueryParams {
  @ApiProperty({
    example:"true",type:Boolean,required:false
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value} ) => value === 'true')
  country_name?:boolean;
}