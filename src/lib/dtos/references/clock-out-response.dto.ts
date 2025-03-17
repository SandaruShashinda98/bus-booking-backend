import { CommonFieldsDTO } from '@common/dto/common-fields.dto';
import { ApiProperty } from '@nestjs/swagger';

//------------- filter clock out reasons ----------------
class FilterReasonDTO extends CommonFieldsDTO {
  @ApiProperty({
    example: 'Lunch break',
    description: 'clock out reason',
    type: String,
    required: true,
  })
  reason: string;
}

export class FilterReasonResponseDTO {
  @ApiProperty({ type: [FilterReasonDTO] })
  data: FilterReasonDTO[];

  @ApiProperty({ type: Number })
  count: number;
}

//------------- create reason ----------------
class CreateReasonResDTO extends CommonFieldsDTO {
  @ApiProperty({
    example: 'Lunch break',
    description: 'clock out reason',
    type: String,
    required: true,
  })
  reason: string;
}

export class CreateClockOutReasonResponseDTO {
  @ApiProperty({ type: CreateReasonResDTO })
  data: CreateReasonResDTO;
}

//------------- update reason ----------------
export class UpdateReasonResponseDTO {
  @ApiProperty({ type: CreateReasonResDTO })
  data: CreateReasonResDTO;
}
