/* The UsersModule class in TypeScript is a global module that provides Mongoose schemas for user and
authentication credentials, along with a UsersDatabaseService provider. */
import { Global, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DB_COLLECTION_NAMES } from '@constant/common/db-collection-names';
import { UserSchema } from './schemas/user.schema';
import { UsersDatabaseService } from './services/user.database.service';
import { UserController } from './controllers/user.controller';
import { UsersService } from './services/user.service';
import { UserCreateService } from './services/user-creation.service';

const services = [UsersDatabaseService, UsersService, UserCreateService];
@Global()
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: DB_COLLECTION_NAMES.USERS, schema: UserSchema },
    ]),
  ],
  controllers: [UserController],
  providers: services,
  exports: services,
})
export class UsersModule {}
