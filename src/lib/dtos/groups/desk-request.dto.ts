import { CommonEditFieldsRequestDTO } from '@common/dto/common-fields.dto';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsString, IsNotEmpty, IsArray, IsOptional } from 'class-validator';

export class CreateDeskDTO {
  @ApiProperty({ example: 'Main Desk', type: String, required: true })
  @IsString()
  @IsNotEmpty()
  @Transform((subject) => subject?.value?.trim())
  name: string;

  @ApiProperty({
    description: 'Array of user ids associated with this desk',
    example: [
      '123e4567-e89b-12d3-a456-426614174000',
      '987fcdeb-51a2-12d3-a456-426614174000',
    ],
    type: [String],
    required: false,
    isArray: true,
  })
  @IsArray()
  @IsOptional()
  users?: string[];
}

export type EditDeskDTO = Partial<CreateDeskDTO> & CommonEditFieldsRequestDTO;
