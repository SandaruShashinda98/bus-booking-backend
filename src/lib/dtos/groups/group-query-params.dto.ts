import { GetCommonQueryDTO } from '@common/dto/common-query.dto';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsOptional, IsString } from 'class-validator';

export class GetGroupQueryDTO extends GetCommonQueryDTO {
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
}
