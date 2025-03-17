import { CommonFieldsDTO } from '@common/dto/common-fields.dto';
import { ApiProperty } from '@nestjs/swagger';

class SkillGroupResDTO extends CommonFieldsDTO {
  @ApiProperty({
    example: 'Spanish Speaking',
    description: 'Name of the skill group',
    required: true,
    type: String,
  })
  name: string;

  @ApiProperty({
    example: 'This is a list of Spanish Speaking Agents',
    description: 'description of the Skill group',
    type: String,
    required: false,
  })
  description: string;

  @ApiProperty({
    example: ['dj3hbd234hjb4bd5sb3db', 'dj3hbd234hjb4bds5sb3db'],
    description: 'list of users assigned to the skill group',
    isArray: true,
    type: String,
  })
  users: string[];
}

//------------- create skill group ----------------
export class CreateSkillGroupResponseDTO {
  @ApiProperty({ type: SkillGroupResDTO })
  data: SkillGroupResDTO;
}

//------------- filter skill groups ----------------
export class FilterSkillGroupResponseDTO {
  @ApiProperty({ type: [SkillGroupResDTO] })
  data: SkillGroupResDTO[];
}

//------------- user list in a skill group ----------------
class SkillGroupUsersResDTO extends CommonFieldsDTO {
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

export class SkillGroupUsersResponseDTO {
  @ApiProperty({ type: [SkillGroupUsersResDTO] })
  data: SkillGroupUsersResDTO[];
}
