import { Global, Module } from '@nestjs/common';
import { DB_COLLECTION_NAMES } from '@constant/common/db-collection-names';
import { MongooseModule } from '@nestjs/mongoose';
import { SettingsSchema } from './schemas/settings.schema';
import { GeneralSettingsController } from './controllers/general-settings.controller';
import { SettingsService } from './services/settings.service';
import { GeneralSettingsDatabaseService } from './services/general-settings.database.service';
import { ObjectListSchema } from './schemas/object-list.schema';
import { ObjectListController } from './controllers/object-list.controller';
import { ObjectListsDatabaseService } from './services/object-list.database.service';
import { IpACLDatabaseService } from './services/ip-acl.database.service';
import { SIpACLSchema } from './schemas/ip-acl.schema';
import { IpACLController } from './controllers/ip-acl.controller';

const services = [
  SettingsService,
  GeneralSettingsDatabaseService,
  ObjectListsDatabaseService,
  IpACLDatabaseService,
];
@Global()
@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: DB_COLLECTION_NAMES.OBJECT_LISTS,
        schema: ObjectListSchema,
      },
      {
        name: DB_COLLECTION_NAMES.SETTINGS,
        schema: SettingsSchema,
      },
      {
        name: DB_COLLECTION_NAMES.IP_ACL,
        schema: SIpACLSchema,
      },
    ]),
  ],
  controllers: [
    GeneralSettingsController,
    ObjectListController,
    IpACLController,
  ],
  providers: services,
  exports: services,
})
export class SettingsModule {}
