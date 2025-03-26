import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  UseGuards,
  Query,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { ObjectIDPathDTO } from '@common/dto/object-id.path.dto';
import { RESPONSE_MESSAGES } from '@constant/common/responses';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { LoggedUser } from '@common/decorators/logged-user.decorator';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { ILoggedUser } from '@interface/authorization/user';
import { GetClockOutReasonQueryDTO } from '@dto/references/clock-out-query-param';
import { FilterReasonResponseDTO } from '@dto/references/clock-out-response.dto';
import { Permissions } from '@common/decorators/permissions.decorator';
import { PermissionGuard } from '@common/guards/permission.guard';
import { PERMISSIONS } from '@constant/authorization/roles';
import { LogRequest } from '@common/decorators/log-request-response.decorator';
import { CommonSearchResponseDTO } from '@common/dto/common-fields.dto';
import { MenuService } from './menu.service';
import { IMenu } from '@interface/booking/booking';

@ApiTags('menu')
@Controller({ path: 'menu' })
export class MenuController {
  constructor(private readonly menuService: MenuService) {}

  @ApiOperation({
    summary: 'Get all menu with filters and pagination',
  })
  @ApiResponse({ type: FilterReasonResponseDTO })
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Permissions(PERMISSIONS.ADMIN)
  @Get()
  async filterMenu(@Query() queryParams: GetClockOutReasonQueryDTO) {
    // const filters = this.referenceService.getClockOutFilters(queryParams);

    const foundMenus = await this.menuService.filterDocumentsWithPagination(
      {},
      queryParams.start || 0,
      queryParams.size || 0,
    );

    return foundMenus;
  }

  @ApiOperation({
    summary: 'Get all menus - for search',
  })
  @ApiResponse({ type: CommonSearchResponseDTO })
  @UseGuards(JwtAuthGuard)
  @Permissions(PERMISSIONS.ADMIN)
  @Get('search')
  async filterSearchMenu(@Query() queryParams: GetClockOutReasonQueryDTO) {
    // const filters = this.referenceService.getClockOutFilters(queryParams);

    const foundReasons = await this.menuService.filterSearchData(
      {},
      queryParams.start || 0,
      queryParams.size || 0,
      '$reason',
    );

    return foundReasons;
  }

  @ApiOperation({ summary: 'Create new menu' })
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Permissions(PERMISSIONS.ADMIN)
  @Post()
  async createMenu(
    @Body() createMenuDto: any,
    @LoggedUser() loggedUser: ILoggedUser,
  ) {
    const menu: IMenu = {
      ...createMenuDto,
    };

    const newMenu = await this.menuService.addNewDocument(menu);

    if (!newMenu)
      throw new InternalServerErrorException([RESPONSE_MESSAGES.DB_FAILURE]);

    return { data: newMenu };
  }

  @ApiOperation({ summary: 'Update menu' })
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Permissions(PERMISSIONS.ADMIN)
  @LogRequest('clock-out-reasons -> updateClockOutReason')
  @Patch(':id')
  async updateMenu(
    @LoggedUser() loggedUser: ILoggedUser,
    @Param() pathParams: ObjectIDPathDTO,
    @Body() updateMenuDto: any,
  ) {
    const foundMenu = await this.menuService.findById(pathParams.id);

    if (!foundMenu)
      throw new NotFoundException([RESPONSE_MESSAGES.DATA_NOT_FOUND]);

    const updatedMenu = await this.menuService.updateDocument({
      ...foundMenu,
      ...updateMenuDto,
      changed_by: loggedUser._id,
    });

    if (!updatedMenu)
      throw new InternalServerErrorException([RESPONSE_MESSAGES.DB_FAILURE]);

    return { data: updatedMenu };
  }
}
