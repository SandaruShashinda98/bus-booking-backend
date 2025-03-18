import { Global, Module } from '@nestjs/common';
import { DB_COLLECTION_NAMES } from '@constant/common/db-collection-names';
import { MongooseModule } from '@nestjs/mongoose';
import { RolesDatabaseService } from './services/roles.database.service';
import { RolesController } from './controllers/roles.controller';
import { RoleSchema } from './schemas/roles.schema';
import { RolesService } from './services/roles.service';
import { UserSchema } from '@module/users/schemas/user.schema';
import { UsersDatabaseService } from '@module/users/services/user.database.service';
import { UsersService } from '@module/users/services/user.service';

const MongooseModules = [
  { name: DB_COLLECTION_NAMES.USERS, schema: UserSchema },
  {
    name: DB_COLLECTION_NAMES.ROLES,
    schema: RoleSchema,
  },
];
const services = [RolesDatabaseService, RolesService, UsersDatabaseService, UsersService];
@Global()
@Module({
imports: [MongooseModule.forFeature(MongooseModules)],
  controllers: [RolesController],
  providers: services,
  exports: services,
})
export class RoleModule {}
