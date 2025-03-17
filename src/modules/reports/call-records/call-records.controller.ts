import { Body, Controller, HttpCode, Post, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CallRecordsService } from './call-records.service';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { CallRecordsRequestBodyFilter } from '@dto/reports/call-records-request.dto';
import { CallsDatabaseService } from '@module/workspace/services/calls.database.service';
import { CallRecordsResponseDto } from '@dto/reports/call-records-response.dto';
import { PermissionGuard } from '@common/guards/permission.guard';
import { PERMISSIONS } from '@constant/authorization/roles';
import { Permissions } from '@common/decorators/permissions.decorator';
import { LogRequest } from '@common/decorators/log-request-response.decorator';

@ApiTags('call-records')
@Controller()
export class CallRecordsController {
  constructor(
    private readonly callRecordsService: CallRecordsService,
    private readonly callsDatabaseService: CallsDatabaseService,
  ) {}
  @ApiOperation({
    summary: 'Get all call records with pagination',
  })
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Permissions(PERMISSIONS.ADMIN, PERMISSIONS.SUPPORT)
  @LogRequest('reports -> call-records -> filterCallRecords')
  @ApiResponse({type:CallRecordsResponseDto})
  @UseGuards(JwtAuthGuard)
  @Post('list')
  async filterCallRecords(
    @Body() callRecordsRequestBodyFilter: CallRecordsRequestBodyFilter,
  ) {
    const filter = this.callRecordsService.getCallRecordsSummaryFilter(
      callRecordsRequestBodyFilter,
    );

    const filteredData = await this.callsDatabaseService.filterCallRecords(
      filter,
      callRecordsRequestBodyFilter.start ?? 0,
      callRecordsRequestBodyFilter.size ?? 0,
    );

    return this.callRecordsService.getResponseDto(filteredData);
  }
}
