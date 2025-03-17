import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { PERMISSIONS } from '@constant/authorization/roles';
import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { Permissions } from '@common/decorators/permissions.decorator';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('group-stat')
@Controller() // No path prefix as it's handled by RouterModule
export class GroupController {
  @ApiOperation({
    summary: 'Get all group stat with pagination',
  })
  @UseGuards(JwtAuthGuard)
  @Permissions(PERMISSIONS.ADMIN)
  @Post('list')
  async filterRoles(@Body() queryParams: any) {
    return null;
  }
}
