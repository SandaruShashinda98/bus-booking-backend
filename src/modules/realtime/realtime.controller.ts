import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { PERMISSIONS } from '@constant/authorization/roles';
import { Controller, Get, UseGuards } from '@nestjs/common';
import { Permissions } from '@common/decorators/permissions.decorator';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { RealtimeService } from './realtime.service';
import { PermissionGuard } from '@common/guards/permission.guard';

@ApiTags('realtime')
@Controller({ path: 'realtime' })
export class RealtimeController {
  constructor(private readonly realtimeService: RealtimeService) {}

  @ApiOperation({
    summary: 'Get realtime stats for widgets',
  })
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Permissions(PERMISSIONS.ADMIN, PERMISSIONS.SUPPORT)
  @Get('realtime-stats')
  async getRealtimeStats() {
    const data = this.realtimeService.getRealtimeStats();
    return {
      data,
    };
  }

  @ApiOperation({
    summary: 'Get all user groups stats with pagination',
  })
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Permissions(PERMISSIONS.ADMIN, PERMISSIONS.SUPPORT)
  @Get('user-group-stats')
  async getUserGroupStats() {
    const data = this.realtimeService.getUserGroupStats();
    return {
      data,
      count: data.length,
    };
  }

  @ApiOperation({
    summary: 'Get all agents stats with pagination',
  })
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Permissions(PERMISSIONS.ADMIN, PERMISSIONS.SUPPORT)
  @Get('agents-stats')
  async getAgentsStats() {
    const data = this.realtimeService.getAgentsStats();
    return {
      data,
      count: data.length,
    };
  }
}
