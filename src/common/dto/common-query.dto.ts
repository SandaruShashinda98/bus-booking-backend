import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString } from 'class-validator';
import { IsObjectID } from './object-id.path.dto';

export class GetCommonQueryDTO {
  @ApiProperty({ required: false })
  @IsInt()
  @IsOptional()
  @Type(() => Number)
  start: number;

  @ApiProperty({ required: false })
  @IsInt()
  @IsOptional()
  @Type(() => Number)
  size: number;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  searchKey: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  @IsObjectID()
  _id: string;
}
