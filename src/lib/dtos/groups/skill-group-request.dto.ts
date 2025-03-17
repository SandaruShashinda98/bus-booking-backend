import { CommonEditFieldsRequestDTO } from '@common/dto/common-fields.dto';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsString, IsNotEmpty, IsArray, IsOptional } from 'class-validator';

export class CreateSkillGroupDTO {
  @ApiProperty({
    description: 'Name of the skill group',
    example: 'Spanish Speaking',
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  @Transform((subject) => subject?.value?.trim())
  name: string;

  @ApiProperty({
    description: 'Description of the skill group',
    example: 'This is a list of Spanish Speaking Agents',
    type: String,
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'Array of user ids associated with this skill group',
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

  @ApiProperty({
    description: 'Group id associated with this skill group',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false,
  })
  @IsOptional()
  group?: any;
}

export type EditSkillGroupDTO = Partial<CreateSkillGroupDTO> &
  CommonEditFieldsRequestDTO;
