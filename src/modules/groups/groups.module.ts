import { Module } from '@nestjs/common';
import { DB_COLLECTION_NAMES } from '@constant/common/db-collection-names';
import { MongooseModule } from '@nestjs/mongoose';
import { GroupService } from './services/group.service';
import { GroupDatabaseService } from './services/group.database.service';
import { GroupSchema } from './schemas/group.schema';
import { GroupController } from './controllers/group.controller';
import { SkillGroupSchema } from './schemas/skill-group.schema';
import { SkillGroupsDatabaseService } from './services/skill-group.database.service';
import { SkillGroupController } from './controllers/skill-group.controller';
import { DeskSchema } from './schemas/desk.schema';
import { DeskController } from './controllers/desk.controller';
import { DesksDatabaseService } from './services/desk.database.service';
import { UserGroupService } from './services/user-group.service';
import { UserGroupSchema } from './schemas/user-group.schema';

const services = [
  GroupService,
  GroupDatabaseService,
  SkillGroupsDatabaseService,
  DesksDatabaseService,
  UserGroupService,
];
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: DB_COLLECTION_NAMES.GROUPS, schema: GroupSchema },
      { name: DB_COLLECTION_NAMES.SKILL_GROUPS, schema: SkillGroupSchema },
      { name: DB_COLLECTION_NAMES.DESKS, schema: DeskSchema },
      { name: DB_COLLECTION_NAMES.USER_GROUPS, schema: UserGroupSchema },
    ]),
  ],
  controllers: [GroupController, SkillGroupController, DeskController],
  providers: services,
  exports: services,
})
export class GroupsModule {}
