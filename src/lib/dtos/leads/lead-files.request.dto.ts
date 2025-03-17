import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId } from 'class-validator';
import { Types } from 'mongoose';

export class LeadFileAssignToCampaignRequestDto {
  @ApiProperty({
    description: 'The ObjectId of the campaign',
    type: String,
    example: '507f191e810c19729de860ea',
  })
  @IsMongoId()
  campaign_id: Types.ObjectId;

  @ApiProperty({
    description: 'The ObjectId of the lead file',
    type: String,
    example: '507f191e810c19729de860ea',
  })
  @IsMongoId()
  lead_file_id: Types.ObjectId;
}
