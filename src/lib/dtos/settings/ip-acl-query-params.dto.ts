import { GetCommonQueryDTO } from '@common/dto/common-query.dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';
import { ACTIVE_STATE } from '@constant/authorization/user';

export class GetIpQueryDTO extends GetCommonQueryDTO {
  @ApiProperty({
    example: '192.168.1',
    description: 'Partial or full IP address to filter',
    required: false,
    type: String,
  })
  @IsString()
  @IsOptional()
  @Transform(({ value }) => value?.trim())
  ip_address?: string;

  @ApiProperty({
    example: 'office',
    description: 'Description text to filter',
    required: false,
    type: String,
  })
  @IsString()
  @IsOptional()
  @Transform(({ value }) => value?.trim())
  description?: string;

  @ApiProperty({
    example: ACTIVE_STATE.ACTIVE,
    description: 'Filter by active state',
    enum: ACTIVE_STATE,
    required: false,
    type: String,
  })
  @IsEnum(ACTIVE_STATE)
  @IsOptional()
  active_state?: ACTIVE_STATE;
}
