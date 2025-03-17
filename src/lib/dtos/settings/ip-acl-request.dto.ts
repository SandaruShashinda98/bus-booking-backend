import { CommonEditFieldsRequestDTO } from '@common/dto/common-fields.dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsIP, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateIpDTO extends CommonEditFieldsRequestDTO {
  @ApiProperty({
    example: '192.168.1.1',
    description: 'IP address to be added to the ACL',
    required: true,
    type: String,
  })
  @IsIP(4, { message: 'Please provide a valid IPv4 address' })
  @IsNotEmpty()
  @Transform(({ value }) => value.trim())
  ip_address: string;

  @ApiProperty({
    example: 'Office network IP',
    description: 'Description of the IP address entry',
    required: false,
    type: String,
  })
  @IsString()
  @IsOptional()
  @Transform(({ value }) => value?.trim())
  description?: string;
}

export class UpdateIpDTO extends CommonEditFieldsRequestDTO {
  @ApiProperty({
    example: '192.168.1.1',
    description: 'IP address to be updated in the ACL',
    required: false,
    type: String,
  })
  @IsIP(4, { message: 'Please provide a valid IPv4 address' })
  @IsOptional()
  @Transform(({ value }) => value?.trim())
  ip_address?: string;

  @ApiProperty({
    example: 'Office network IP',
    description: 'Description of the IP address entry',
    required: false,
    type: String,
  })
  @IsString()
  @IsOptional()
  @Transform(({ value }) => value?.trim())
  description?: string;
}
