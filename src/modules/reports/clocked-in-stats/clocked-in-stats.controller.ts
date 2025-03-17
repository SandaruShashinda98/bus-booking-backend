import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { PERMISSIONS } from '@constant/authorization/roles';
import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { Permissions } from '@common/decorators/permissions.decorator';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ClockedInService } from './clocked-in-stats.service';

@ApiTags('clocked-in-stat')
@Controller() // No path prefix as it's handled by RouterModule
export class ClockedInController {
  constructor(private readonly clockedInService: ClockedInService) {}

  @ApiOperation({
    summary: 'Get all user clocked in stats with pagination',
  })
  @UseGuards(JwtAuthGuard)
  @Permissions(PERMISSIONS.ADMIN)
  @Post('list')
  async filterRoles(@Body() queryParams: any) {
    const filterData = await this.clockedInService.filterUserClockedInStats(
      queryParams,
      Number(queryParams.start) || 0,
      Number(queryParams.size) || 0,
    );
    return filterData;
  }

  @ApiOperation({
    summary: 'Get all user clocked in stats with pagination',
  })
  @UseGuards(JwtAuthGuard)
  @Permissions(PERMISSIONS.ADMIN)
  @Get('break-down-duration')
  async breakDownDurationList(@Query() queryParams: any) {
    const filterData = this.clockedInService.filterBreakdownReasons();
    return filterData;
  }
}
