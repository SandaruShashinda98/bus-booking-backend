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
} from '@nestjs/common';
import { ObjectIDPathDTO } from '@common/dto/object-id.path.dto';
import { RESPONSE_MESSAGES } from '@constant/common/responses';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { LoggedUser } from '@common/decorators/logged-user.decorator';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { ILoggedUser } from '@interface/authorization/user';
import { Permissions } from '@common/decorators/permissions.decorator';
import { PermissionGuard } from '@common/guards/permission.guard';
import { PERMISSIONS } from '@constant/authorization/roles';
import { BusService } from '../services/bus.service';
import { IBus } from '@interface/booking/booking';

@ApiTags('bus')
@Controller({ path: 'bus' })
export class BusController {
  constructor(private readonly busService: BusService) {}

  @ApiOperation({
    summary: 'Get all busses with filters and pagination',
  })
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Permissions(PERMISSIONS.ADMIN)
  @Get()
  async filterBus(@Query() queryParams: any) {
    const foundBusses = await this.busService.filterDocumentsWithPagination(
      {},
      queryParams.start || 0,
      queryParams.size || 0,
    );

    return foundBusses;
  }

  @ApiOperation({
    summary: 'Get single bus by id',
  })
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Permissions(PERMISSIONS.ADMIN)
  @Get(':id')
  async getSingleClockOutReason(@Param() pathParams: ObjectIDPathDTO) {
    const foundBus = await this.busService.findById(pathParams.id);

    if (!foundBus)
      throw new InternalServerErrorException([RESPONSE_MESSAGES.DB_FAILURE]);

    return { data: foundBus };
  }

  @ApiOperation({ summary: 'Create new bus' })
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Permissions(PERMISSIONS.ADMIN)
  @Post()
  async createNewBus(
    @Body() createReasonDto: any,
    @LoggedUser() loggedUser: ILoggedUser,
  ) {
    const busData: IBus = {
      bus_number: createReasonDto.bus_number,
      is_active: createReasonDto.is_active ?? true,
      created_by: loggedUser._id,
    };

    const newBus = await this.busService.addNewDocument(busData);

    if (!newBus)
      throw new InternalServerErrorException([RESPONSE_MESSAGES.DB_FAILURE]);

    return { data: newBus };
  }

  @ApiOperation({ summary: 'Update bus' })
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Permissions(PERMISSIONS.ADMIN)
  @Patch(':id')
  async updateClockOutReason(
    @LoggedUser() loggedUser: ILoggedUser,
    @Param() pathParams: ObjectIDPathDTO,
    @Body() updateBusDto: any,
  ) {
    const updatedBus = await this.busService.updateDocument({
      ...updateBusDto,
      changed_by: loggedUser._id,
    });

    if (!updatedBus)
      throw new InternalServerErrorException([RESPONSE_MESSAGES.DB_FAILURE]);

    return { data: updatedBus };
  }
}
