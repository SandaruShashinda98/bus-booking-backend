import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsDate,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class LeadDetailsResponseDto {
  // primary details

  @ApiProperty({ example: 'John', type: String })
  @IsString()
  @IsOptional()
  first_name: string;

  @ApiProperty({ example: 'Doe', type: String })
  @IsString()
  @IsOptional()
  last_name: string;

  @ApiProperty({ example: 'LEAD12345', type: String })
  @IsString()
  lead_id: string;

  @ApiProperty({ example: '+1234567890', type: String })
  @IsString()
  @IsOptional()
  phone: string;

  @ApiProperty({ example: '+19876543210', type: String })
  @IsString()
  @IsOptional()
  phone_number_normalized: string;

  @ApiProperty({ example: '+1234567890', type: String })
  @IsString()
  @IsOptional()
  secondary_phone: string;

  @ApiProperty({ example: 'john.doe@example.com', type: String })
  @IsString()
  @IsOptional()
  email: string;

  @ApiProperty({ example: 30, type: Number })
  @IsNumber()
  @IsOptional()
  age: number;

  @ApiProperty({ example: "Bachelor's Degree", type: String })
  @IsString()
  @IsOptional()
  education: string;

  @ApiProperty({ example: 'United States', type: String })
  @IsString()
  @IsOptional()
  country: object;

  @ApiProperty({ example: 'California', type: String })
  @IsString()
  @IsOptional()
  state: string;

  @ApiProperty({ example: 'Los Angeles', type: String })
  @IsString()
  @IsOptional()
  city: string;

  @ApiProperty({ example: '123 Main St', type: String })
  @IsString()
  @IsOptional()
  address: string;

  @ApiProperty({ example: 'PST', type: String })
  @IsString()
  @IsOptional()
  timezone: string;

  // campaigns and engagement details
  @ApiProperty({ example: 'Summer Campaign 2024', type: String })
  @IsString()
  @IsOptional()
  campaign: string;

  @ApiProperty({ example: 'Active', type: String })
  @IsString()
  @IsOptional()
  status: string;

  @ApiProperty({ example: 'Available', type: String })
  @IsString()
  @IsOptional()
  availability: string;

  @ApiProperty({ example: 3, type: Number })
  @IsNumber()
  @IsOptional()
  weight: number;

  @ApiProperty({ example: 5, type: Number })
  @IsNumber()
  @IsOptional()
  calls: number;

  @ApiProperty({ example: 'Pending Approval', type: String })
  @IsString()
  @IsOptional()
  sub_status: string;

  @ApiProperty({ example: 'New', type: String })
  @IsString()
  @IsOptional()
  lead_state: string;

  @ApiProperty({ example: 'High Risk', type: String })
  @IsString()
  @IsOptional()
  hlr: string;

  @ApiProperty({ example: 'Conversion Funnel', type: String })
  @IsString()
  @IsOptional()
  funnel: unknown;

  @ApiProperty({ example: 'Premium', type: String })
  @IsString()
  @IsOptional()
  tag: unknown;

  @ApiProperty({ example: 'XYZ123', type: String })
  @IsString()
  @IsOptional()
  original_identifier: string;

  @ApiProperty({ example: 'Q1 2024', type: String })
  @IsString()
  @IsOptional()
  lead_period: string;

  @ApiProperty({ example: '2024-11-01T12:00:00Z', type: Date })
  @IsDate()
  @IsOptional()
  call_after: Date;

  @ApiProperty({ example: 'Agent001', type: String })
  @IsString()
  @IsOptional()
  assigned_to: string;

  @ApiProperty({ example: true, type: Boolean })
  @IsOptional()
  duplicate: unknown;

  @ApiProperty({ example: false, type: Boolean })
  @IsOptional()
  with_error: unknown;

  @ApiProperty({ example: { info: 'Missing data' }, type: Object })
  @IsOptional()
  brm_info: unknown;

  @ApiProperty({ example: 'Thank you for your response', type: String })
  @IsString()
  @IsOptional()
  sms_reply: string;

  @ApiProperty({ example: 5, type: Number })
  @IsNumber()
  @IsOptional()
  experience: number;

  @ApiProperty({
    example: 'Candidate has 5 years of sales experience',
    type: String,
  })
  @IsString()
  @IsOptional()
  explanation: string;

  @ApiProperty({
    example: 'Lead is promising, requires follow-up',
    type: String,
  })
  @IsString()
  @IsOptional()
  notes: string;

  // system details
  @ApiProperty({ example: 'leads_2024.csv', type: String })
  @IsString()
  @IsOptional()
  lead_file_name: string;

  @ApiProperty({ example: 'system_user', type: String })
  @IsString()
  @IsOptional()
  api_user: string;

  @ApiProperty({ example: '2024-11-01T12:00:00Z', type: Date })
  @IsDate()
  created_at: Date;

  @ApiProperty({ example: '2024-11-01T12:00:00Z', type: Date })
  @IsDate()
  updated_at: Date;

  @ApiProperty({ example: 'Data inconsistency detected', type: String })
  @IsString()
  @IsOptional()
  with_error_system: string;

  // custom fields
  @ApiProperty({ example: ['Interested', 'Follow-up Needed'], type: [String] })
  @IsArray()
  @IsOptional()
  custom?: string[];
}
