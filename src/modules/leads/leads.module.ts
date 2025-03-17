import { forwardRef, Global, Module } from '@nestjs/common';
import { DB_COLLECTION_NAMES } from '@constant/common/db-collection-names';
import { MongooseModule } from '@nestjs/mongoose';
import { S3Service } from '@common/services/s3.service';
import StreamService from '@common/services/stream.service';
import { HttpModule } from '@nestjs/axios';
import { LeadCommentController } from './lead-comments/lead-comment.controller';
import { LeadCommentsDatabaseService } from './lead-comments/lead-comment.database.service';
import { LeadCommentSchema } from './lead-comments/lead-comments.schema';
import { LeadFileController } from './lead-files/lead-file.controller';
import { LeadFileService } from './lead-files/lead-file.service';
import { LeadEntityFilterController } from './lead-saved-filters/lead-filter.controller';
import { LeadsFilterDatabaseService } from './lead-saved-filters/lead-filter.database.service';
import { LeadEntityFilterSchema } from './lead-saved-filters/lead-filter.schema';
import { LeadStatusController } from './lead-status/lead-status.controller';
import { LeadStatusDatabaseService } from './lead-status/lead-status.database.service';
import { LeadStatusService } from './lead-status/lead-status.service';
import { LeadStatusSchema } from './lead-status/lead-statuses.schema';
import { LeadDenyListController } from './lead/controllers/lead-denylist.controller';
import { LeadDetailsController } from './lead/controllers/lead-details.controller';
import { LeadController } from './lead/controllers/lead.controller';
import { LeadSchema } from './lead/schemas/lead.schema';
import { LeadDenyListService } from './lead/services/lead-deny-list.service';
import { LeadDatabaseService } from './lead/services/leads.database.service';
import { LeadService } from './lead/services/leads.service';
import { LeadCommentsService } from './lead-comments/lead-comments.service';
import { LeadGroupFilterService } from './lead/services/lead-group-filter.service';
import { GroupsModule } from '@module/groups/groups.module';

const services = [
  LeadDatabaseService,
  LeadService,
  LeadsFilterDatabaseService,
  LeadFileService,
  LeadCommentsDatabaseService,
  LeadCommentsService,
  LeadDenyListService,
  S3Service,
  StreamService,
  LeadStatusDatabaseService,
  LeadStatusService,
  LeadGroupFilterService,
];
const controllers = [
  LeadController,
  LeadEntityFilterController,
  LeadFileController,
  LeadCommentController,
  LeadDetailsController,
  LeadDenyListController,
  LeadStatusController,
];
@Global()
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: DB_COLLECTION_NAMES.LEADS, schema: LeadSchema },
      {
        name: DB_COLLECTION_NAMES.LEAD_ENTITY_FILTERS,
        schema: LeadEntityFilterSchema,
      },
      {
        name: DB_COLLECTION_NAMES.LEAD_COMMENTS,
        schema: LeadCommentSchema,
      },
      {
        name: DB_COLLECTION_NAMES.LEAD_STATUS,
        schema: LeadStatusSchema,
      },
    ]),
    forwardRef(() => GroupsModule),
    HttpModule,
  ],
  controllers: controllers,
  providers: services,
  exports: services,
})
export class LeadsModule {}
