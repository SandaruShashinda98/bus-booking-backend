import { Global, Module } from '@nestjs/common';
import { DB_COLLECTION_NAMES } from '@constant/common/db-collection-names';
import { MongooseModule } from '@nestjs/mongoose';
import { RolesDatabaseService } from './services/roles.database.service';
import { RolesController } from './controllers/roles.controller';
import { RoleSchema } from './schemas/roles.schema';
import { RolesService } from './services/roles.service';

const services = [RolesDatabaseService, RolesService];
@Global()
@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: DB_COLLECTION_NAMES.ROLES,
        schema: RoleSchema,
      },
    ]),
  ],
  controllers: [RolesController],
  providers: services,
  exports: services,
})
export class RoleModule {}
