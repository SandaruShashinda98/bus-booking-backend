import { GetCommonQueryDTO } from '@common/dto/common-query.dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class GetLeadCommentQueryDTO extends GetCommonQueryDTO {
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  comment: string;
}
