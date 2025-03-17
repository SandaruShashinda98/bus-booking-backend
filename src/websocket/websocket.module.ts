import { Global, Module, forwardRef } from '@nestjs/common';
import { AuthModule } from '@module/authentication/auth.module';
import { EventsGateway } from './websocket.gateway';
import { UsersService } from '@module/users/services/user.service';

const services = [EventsGateway, UsersService];
@Global()
@Module({
  imports: [forwardRef(() => AuthModule)],
  providers: services,
  exports: services,
})
export class WebSocketModule {}
