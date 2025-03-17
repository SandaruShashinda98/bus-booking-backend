import { CommonFieldsDTO } from '@common/dto/common-fields.dto';
import { ApiProperty } from '@nestjs/swagger';

class DeskResDTO extends CommonFieldsDTO {
  @ApiProperty({
    example: 'Spanish Speaking',
    description: 'Name of the desk',
    required: true,
    type: String,
  })
  name: string;

  @ApiProperty({
    example: ['dj3hbd234hjb4bd5sb3db', 'dj3hbd234hjb4bds5sb3db'],
    description: 'list of users assigned to the desk',
    isArray: true,
    type: String,
  })
  users: string[];
}

//------------- create desk ----------------
export class CreateDeskResponseDTO {
  @ApiProperty({ type: DeskResDTO })
  data: DeskResDTO;
}

//------------- filter desks ----------------
export class FilterDesksResponseDTO {
  @ApiProperty({ type: [DeskResDTO] })
  data: DeskResDTO[];
}

//------------- user list in a desk ----------------
class DeskUsersResDTO extends CommonFieldsDTO {
  @ApiProperty({
    example: 'John',
    description: 'first name of the user',
    required: true,
    type: String,
  })
  first_name: string;

  @ApiProperty({
    example: 'Doe',
    description: 'last name of the user',
    required: true,
    type: String,
  })
  last_name: string;

  @ApiProperty({
    example: 'dj3hbd234hjb4bd5sb3db',
    description: '_id of the user',
    type: String,
  })
  user_id: string[];
}

export class DeskUsersResponseDTO {
  @ApiProperty({ type: [DeskUsersResDTO] })
  data: DeskUsersResDTO[];
}
