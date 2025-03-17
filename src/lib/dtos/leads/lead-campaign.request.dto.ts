import { ApiProperty } from '@nestjs/swagger';
import { LeadCampaignDto } from './lead-campaign.dto';
import { IsBoolean, IsMongoId, IsOptional, IsString } from 'class-validator';
import { Types } from 'mongoose';

export class CreateLeadCampaignBodyDto extends LeadCampaignDto {}

export class UpdateLeadCampaignBodyDto extends LeadCampaignDto {
  @ApiProperty({
    example: true,
    description: 'Indicates if the entity is deleted or not',
    required: false,
    type: Boolean,
  })
  @IsOptional()
  @IsBoolean()
  is_delete: boolean;
}

export class LeadCampaignCheckExistenceDto {
  @ApiProperty({
    example: 'Dwayne',
    required: true,
  })
  @IsString()
  name: string;

  @ApiProperty({
    example: '67b5ce43039895d0862f597e',
    required: false,
    type: Types.ObjectId,
  })
  @IsOptional()
  @IsMongoId()
  _id?: string;
}
