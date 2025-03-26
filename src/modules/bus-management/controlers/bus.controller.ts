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

@ApiTags('bus-fleet')
@Controller({ path: 'bus-fleet' })
export class BusController {
  constructor(private readonly busService: BusService) {}

  @ApiOperation({
    summary: 'Get all busses with filters and pagination',
  })
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Permissions(PERMISSIONS.ADMIN, PERMISSIONS.SUPPORT, PERMISSIONS.AGENT)
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
  @Permissions(PERMISSIONS.ADMIN, PERMISSIONS.SUPPORT, PERMISSIONS.AGENT)
  @Get(':id')
  async getSingleBus(@Param() pathParams: ObjectIDPathDTO) {
    const foundBus = await this.busService.findById(pathParams.id);

    if (!foundBus)
      throw new InternalServerErrorException([RESPONSE_MESSAGES.DB_FAILURE]);

    return { data: foundBus };
  }

  @ApiOperation({ summary: 'Create new bus' })
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Permissions(PERMISSIONS.ADMIN, PERMISSIONS.SUPPORT, PERMISSIONS.AGENT)
  @Post()
  async createNewBus(
    @Body() createReasonDto: any,
    @LoggedUser() loggedUser: ILoggedUser,
  ) {
    const busData: IBus = {
      bus_number: createReasonDto.bus_number,
      make_model: createReasonDto.make_model,
      year_of_manufacture: createReasonDto.year_of_manufacture,
      seating_capacity: createReasonDto.seating_capacity,
      facility_details: createReasonDto.facility_details,
      assigned_route: createReasonDto.assigned_route,
      driver_conductor_linked: createReasonDto.driver_conductor_linked,
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
  @Permissions(PERMISSIONS.ADMIN, PERMISSIONS.SUPPORT, PERMISSIONS.AGENT)
  @Patch(':id')
  async updateBus(
    @LoggedUser() loggedUser: ILoggedUser,
    @Param() pathParams: ObjectIDPathDTO,
    @Body() updateBusDto: any,
  ) {
    const foundBus = await this.busService.findById(pathParams.id);

    const updatedBus = await this.busService.updateDocument({
      ...foundBus,
      ...updateBusDto,
      changed_by: loggedUser._id,
    });

    if (!updatedBus)
      throw new InternalServerErrorException([RESPONSE_MESSAGES.DB_FAILURE]);

    return { data: updatedBus };
  }
}
