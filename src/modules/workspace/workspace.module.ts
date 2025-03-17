import { Global, Module } from '@nestjs/common';
import { WorkspaceController } from './controllers/workspace.controller';
import { WorkspaceService } from './services/workspace.service';
import { HttpModule } from '@nestjs/axios';
import { PbxService } from '@module/pbx/services/pbx.service';
import { PbxAuthService } from '@module/pbx/services/pbx-auth.service';
import { MongooseModule } from '@nestjs/mongoose';
import { DB_COLLECTION_NAMES } from '@constant/common/db-collection-names';
import { CallSchema } from './schemas/calls.schema';
import { CallsService } from './services/calls.service';
import { CallsDatabaseService } from './services/calls.database.service';
import { CallsController } from './controllers/calls.controller';

const services = [
  WorkspaceService,
  PbxAuthService,
  PbxService,
  CallsService,
  CallsDatabaseService,
];
@Global()
@Module({
  imports: [
    HttpModule,
    MongooseModule.forFeature([
      {
        name: DB_COLLECTION_NAMES.CALLS,
        schema: CallSchema,
      },
    ]),
  ],
  controllers: [WorkspaceController, CallsController],
  providers: services,
  exports: services,
})
export class WorkspaceModule {}
