import { Global, Module } from '@nestjs/common';
import { PbxService } from './services/pbx.service';
import { PbxAuthService } from './services/pbx-auth.service';

const services = [PbxAuthService, PbxService];
@Global()
@Module({
  imports: [],
  controllers: [],
  providers: services,
  exports: services,
})
export class PbxModule {}
