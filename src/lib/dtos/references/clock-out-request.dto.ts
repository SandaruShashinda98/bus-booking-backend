import { CommonEditFieldsRequestDTO } from '@common/dto/common-fields.dto';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsString, IsNotEmpty, IsBoolean, IsOptional } from 'class-validator';

export class CreateClockOutReasonDTO {
  @ApiProperty({ example: 'Lunch Break', type: String, required: true })
  @IsString()
  @IsNotEmpty()
  @Transform((subject) => subject?.value?.trim())
  reason: string;

  @ApiProperty({
    example: 'true',
    type: Boolean,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  is_active: boolean;
}

export class EditClockOutReasonDTO extends CommonEditFieldsRequestDTO {
  @ApiProperty({ example: 'Lunch Break', type: String, required: false })
  @IsString()
  @IsOptional()
  @Transform((subject) => subject?.value?.trim())
  reason: string;
}
