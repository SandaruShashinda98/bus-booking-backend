import { Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { WorkspaceService } from '../services/workspace.service';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { PERMISSIONS } from '@constant/authorization/roles';
import { Permissions } from '@common/decorators/permissions.decorator';

@ApiTags('workspace')
@Controller({ path: 'workspace' })
export class WorkspaceController {
  constructor(private readonly workspaceService: WorkspaceService) {}

  @ApiOperation({ summary: 'Get all users' })
  @UseGuards(JwtAuthGuard)
  @Get('users')
  async filterUsers() {
    const users = this.workspaceService.getUsers();
    return users;
  }

  @ApiOperation({ summary: 'Get all recent calls' })
  @UseGuards(JwtAuthGuard)
  @Permissions(PERMISSIONS.ADMIN)
  @Post('recent-calls')
  async filterRecentCalls() {
    const recentCalls = this.workspaceService.getRecentCalls();
    return {
      data: recentCalls,
      count: recentCalls.length,
    };
  }

  @ApiOperation({ summary: 'Get all scheduled calls' })
  @UseGuards(JwtAuthGuard)
  @Permissions(PERMISSIONS.ADMIN)
  @Post('scheduled-calls')
  async filterScheduledCalls() {
    const recentCalls = this.workspaceService.getScheduledCalls();
    return {
      data: recentCalls,
      count: recentCalls.length,
    };
  }
}
