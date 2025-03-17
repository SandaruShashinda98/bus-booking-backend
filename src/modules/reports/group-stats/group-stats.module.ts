import { Module } from '@nestjs/common';
import { GroupController } from './group-stats.controller';
import { GroupStatService } from './group-stats.service';

@Module({
  controllers: [GroupController],
  providers: [GroupStatService],
  exports: [GroupStatService],
})
export class GroupStatModule {}
