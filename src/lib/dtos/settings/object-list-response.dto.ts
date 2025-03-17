import { CommonFieldsDTO } from '@common/dto/common-fields.dto';
import { LIST_TYPE } from '@constant/settings/object-list';
import { ApiProperty } from '@nestjs/swagger';

//------------- filter object-list  ----------------
class FilterObjectListResDTO extends CommonFieldsDTO {
  @ApiProperty({
    example: 'Call Again - General',
    description: 'name of the object-list',
    type: String,
    required: true,
  })
  name: string;

  @ApiProperty({
    example: LIST_TYPE.CUSTOM,
    description: 'list type - CUSTOM/COUNTRIES/LEADS',
    type: String,
    enum: LIST_TYPE,
    required: true,
  })
  list_type: LIST_TYPE;

  @ApiProperty({
    example: '10',
    description: 'number of objects in the list',
    type: Number,
    required: true,
  })
  object_count: number;
}

export class FilterObjectListResponseDTO {
  @ApiProperty({ type: [FilterObjectListResDTO] })
  data: FilterObjectListResDTO[];

  @ApiProperty({ type: Number })
  count: number;
}

//------------- create role ----------------
class CreateObjectListResDTO extends CommonFieldsDTO {
  @ApiProperty({
    example: 'Call Again - General',
    description: 'name of the object-list',
    type: String,
    required: true,
  })
  name: string;

  @ApiProperty({
    example: LIST_TYPE.CUSTOM,
    description: 'list type - CUSTOM/COUNTRIES/LEADS',
    type: String,
    enum: LIST_TYPE,
    required: true,
  })
  list_type: LIST_TYPE;

  @ApiProperty({
    example: ['item1', 'item2'],
    description: 'List of objects, varies by list type',
    isArray: true,
    type: String,
    required: true,
  })
  objects: string[];
}

export class CreateObjectListResponseDTO {
  @ApiProperty({ type: CreateObjectListResDTO })
  data: CreateObjectListResDTO;
}

//------------object inside object-list ---------
export class ObjectsResponseDTO {
  @ApiProperty({ type: [String] })
  data: string[];
}
