import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class StringIDPathDTO {
  @ApiProperty({
    name: 'id',
    description: 'A unique string id to identify the document',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  id: string;
}
