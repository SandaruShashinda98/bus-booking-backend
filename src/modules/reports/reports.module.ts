import { Module } from '@nestjs/common';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';
import { RouterModule, Routes } from '@nestjs/core';
import { ClockedInModule } from './clocked-in-stats/clocked-in-stats.module';
import { GroupStatModule } from './group-stats/group-stats.module';
import { CallRecordsModule } from './call-records/call-records.module';

export const reportRoutes: Routes = [
  {
    path: 'reports/clocked-in-stat',
    module: ClockedInModule,
  },
  {
    path: 'reports/group-stat',
    module: GroupStatModule,
  },
  {
    path: 'reports/call-records',
    module: CallRecordsModule,
  },
];

@Module({
  imports: [
    ClockedInModule,
    GroupStatModule,
    CallRecordsModule,
    RouterModule.register(reportRoutes),
  ],
  controllers: [ReportsController],
  providers: [ReportsService],
  exports: [ReportsService],
})
export class ReportsModule {}
