import { GetCommonQueryDTO } from '@common/dto/common-query.dto';
import { LEAD_CAMPAIGN_STATUS } from '@constant/leads/lead-campaign';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsArray, IsOptional, IsString } from 'class-validator';

export class LeadCampaignsRequestQueryDto extends GetCommonQueryDTO {
  @ApiProperty({
    example: ['123456789', '987654321'],
    description: 'the ids of campaigns to be filtered',
  })
  @IsArray()
  @IsOptional()
  @Transform(({ value }) =>
    (Array.isArray(value) ? value : [value]).filter(Boolean),
  )
  campaign?: string[];

  @IsString()
  @IsOptional()
  status?: LEAD_CAMPAIGN_STATUS;
}

export class GetLeadCampaignNamesRequestQueryDto extends GetCommonQueryDTO {}
