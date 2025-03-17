import { Global, Module, forwardRef } from '@nestjs/common';
import { AuthModule } from '@module/authentication/auth.module';
import { EventsGateway } from './websocket.gateway';
import { UsersService } from '@module/users/services/user.service';
import { UserGroupService } from '@module/groups/services/user-group.service';
import { GroupsModule } from '@module/groups/groups.module';

const services = [EventsGateway, UsersService];
@Global()
@Module({
  imports: [forwardRef(() => AuthModule), GroupsModule],
  providers: services,
  exports: services,
})
export class WebSocketModule {}
