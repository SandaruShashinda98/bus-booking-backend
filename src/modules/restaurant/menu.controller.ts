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
  BadRequestException,
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
  @Get()
  async filterMenu(@Query() queryParams: GetClockOutReasonQueryDTO) {
    const foundMenus = await this.menuService.filterDocumentsWithPagination(
      {},
      queryParams.start || 0,
      queryParams.size || 0,
    );

    return foundMenus;
  }

  @ApiOperation({
    summary: 'Get all orders',
  })
  @ApiResponse({ type: FilterReasonResponseDTO })
  @Get('orders')
  async filterOrder() {
    const foundMenus = await this.menuService.filterMenuOrders();

    return foundMenus;
  }

  @ApiOperation({
    summary: 'Get all menus - for search',
  })
  @ApiResponse({ type: CommonSearchResponseDTO })
  @Get('search')
  async filterSearchMenu(@Query() queryParams: GetClockOutReasonQueryDTO) {
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
  async createMenu(@Body() createMenuDto: any) {
    const menu: IMenu = {
      ...createMenuDto,
    };

    const newMenu = await this.menuService.addNewDocument(menu);

    if (!newMenu)
      throw new InternalServerErrorException([RESPONSE_MESSAGES.DB_FAILURE]);

    return { data: newMenu };
  }

  // public
  @ApiOperation({ summary: 'Update menu' })
  @LogRequest('clock-out-reasons -> updateClockOutReason')
  @Patch('food')
  async updateMenuFoods(
    @Body() updateMenuDto: Array<{ itemId: string; count: number; nic: any }>,
  ) {
    if (!updateMenuDto?.length) {
      return {
        data: null,
      };
    }

    try {
      // Use Promise.all to properly await all async operations
      await Promise.all(
        updateMenuDto.map(async (menu) => {
          const foundMenu = await this.menuService.findById(menu.itemId);

          if (!foundMenu) {
            throw new NotFoundException(
              `Menu item with ID ${menu.itemId} not found`,
            );
          }

          console.log(foundMenu);

          return this.menuService.updateDocument({
            ...foundMenu,
            orders: [
              ...(Array.isArray(foundMenu?.orders) ? foundMenu.orders : []),
              { order_by_nic: menu?.nic, qty: menu.count },
            ],
          });
        }),
      );

      return { data: updateMenuDto };
    } catch (error) {
      throw new BadRequestException(
        error.message || 'Failed to update menu items',
      );
    }
  }

  @ApiOperation({ summary: 'Update menu' })
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Permissions(PERMISSIONS.ADMIN, PERMISSIONS.SUPPORT, PERMISSIONS.AGENT)
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
      orders: [...foundMenu.orders, ...updateMenuDto.orders],
      changed_by: loggedUser._id,
    });

    if (!updatedMenu)
      throw new InternalServerErrorException([RESPONSE_MESSAGES.DB_FAILURE]);

    return { data: updatedMenu };
  }
}
