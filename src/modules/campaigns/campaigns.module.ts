import { Module } from '@nestjs/common';
import { DB_COLLECTION_NAMES } from '@constant/common/db-collection-names';
import { MongooseModule } from '@nestjs/mongoose';
import { CampaignsController } from './controllers/campaigns.controller';
import { LeadCampaignSchema } from './schemas/campaign.schema';
import { CampaignDatabaseService } from './services/campaign.database.service';
import { CampaignService } from './services/campaign.service';

const services = [CampaignDatabaseService, CampaignService];
@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: DB_COLLECTION_NAMES.LEAD_CAMPAIGN,
        schema: LeadCampaignSchema,
      },
    ]),
  ],
  controllers: [CampaignsController],
  providers: services,
  exports: services,
})
export class CampaignModule {}
