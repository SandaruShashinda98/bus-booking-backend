import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString } from 'class-validator';
import { IsObjectID } from './object-id.path.dto';
import { Types } from 'mongoose';

export class CommonFieldsDTO {
  @ApiProperty({
    example: 'dj3hbd234hjb4bd5sb3db',
    description: 'obj id of the entity',
    type: String,
    required: true,
  })
  @IsObjectID()
  _id: string | Types.ObjectId;

  @ApiProperty({
    example: '2024-08-08T08:34:21.856Z',
    description: 'Date and time when the entity was created',
    required: true,
    type: Date,
  })
  created_on: Date;

  @ApiProperty({
    example: '66b476d929f8c6af6fe4feec',
    description: 'ID of the user who last created the entity',
    required: true,
    type: String,
  })
  created_by: string;

  @ApiProperty({
    example: '2024-08-08T08:34:21.856Z',
    description: 'Date and time when the entity was last modified',
    required: false,
    type: Date,
  })
  last_modified_on: Date;

  @ApiProperty({
    example: '66b476d929f8c6af6fe4feec',
    description: 'ID of the user who last changed the entity',
    required: true,
    type: String,
  })
  changed_by: string;

  @ApiProperty({
    example: true,
    description: 'Indicates if the entity is active',
    required: true,
    type: Boolean,
  })
  is_active: boolean;

  @ApiProperty({
    example: true,
    description: 'Indicates if the entity is deleted or not',
    required: true,
    type: Boolean,
  })
  is_delete: boolean;
}

export class CommonEditFieldsRequestDTO {
  @ApiProperty({
    example: 'dj3hbd234hjb4bd5sb3db',
    description: 'obj id of the entity',
    type: String,
    required: false,
  })
  @IsOptional()
  @IsObjectID()
  _id: any;

  @ApiProperty({
    example: true,
    description: 'Indicates if the entity is deleted or not',
    required: false,
    type: Boolean,
  })
  @IsOptional()
  @IsBoolean()
  is_delete: boolean;

  @ApiProperty({
    example: true,
    description: 'Indicates if the entity is active',
    required: false,
    type: Boolean,
  })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}

export class CommonSearchDTO {
  @ApiProperty({
    example: 'dj3hbd234hjb4bd5sb3db',
    description: 'obj id of the entity',
    type: String,
    required: true,
  })
  @IsOptional()
  @IsObjectID()
  id: any;

  @ApiProperty({
    example: 'name of the entity',
    description: 'name of the entity',
    type: String,
    required: true,
  })
  @IsOptional()
  @IsString()
  name: string;
}

export class CommonSearchResponseDTO {
  @ApiProperty({ type: [CommonSearchDTO] })
  data: CommonSearchDTO[];
}

export class KeyValueDTO<TKey = string, TValue = string> {
  @ApiProperty({ example: 'key', type: String })
  @IsString()
  key: TKey;

  @ApiProperty({ example: 'value', type: String })
  @IsString()
  value: TValue;
}
