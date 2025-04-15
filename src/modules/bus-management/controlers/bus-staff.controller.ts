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
import { IBusStaff } from '@interface/booking/booking';
import { BusStaffService } from '../services/bus-staff.service';

@ApiTags('bus-staff')
@Controller({ path: 'bus-staff' })
export class BusStaffController {
  constructor(private readonly busStaffService: BusStaffService) {}

  @ApiOperation({
    summary: 'Get all bus staff with filters and pagination',
  })
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Permissions(PERMISSIONS.ADMIN, PERMISSIONS.SUPPORT, PERMISSIONS.AGENT)
  @Get()
  async filterBusStaff(@Query() queryParams: any,    @LoggedUser() loggedUser: ILoggedUser,) {
    const foundBusStaff =
      await this.busStaffService.filterDocumentsWithPagination(
        {created_by: loggedUser._id},
        queryParams.start || 0,
        queryParams.size || 0,
      );

    return foundBusStaff;
  }

  @ApiOperation({
    summary: 'Get single bus staff by id',
  })
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Permissions(PERMISSIONS.ADMIN, PERMISSIONS.SUPPORT, PERMISSIONS.AGENT)
  @Get(':id')
  async getSingleBusStaff(@Param() pathParams: ObjectIDPathDTO) {
    const foundBusStaff = await this.busStaffService.findById(pathParams.id);

    if (!foundBusStaff)
      throw new InternalServerErrorException([RESPONSE_MESSAGES.DB_FAILURE]);

    return { data: foundBusStaff };
  }

  @ApiOperation({ summary: 'Create new bus staff' })
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Permissions(PERMISSIONS.ADMIN, PERMISSIONS.SUPPORT, PERMISSIONS.AGENT)
  @Post()
  async createNewBusStaff(
    @Body() createReasonDto: any,
    @LoggedUser() loggedUser: ILoggedUser,
  ) {
    const busStaffData: IBusStaff = {
      staff_id: createReasonDto.staff_id,
      staff_name: createReasonDto.staff_name,
      role: createReasonDto.role,
      contact_number: createReasonDto.contact_number,
      assigned_bus_number: createReasonDto.assigned_bus_number,
      assigned_trip: createReasonDto.assigned_trip,
      is_active: createReasonDto.is_active ?? true,
      created_by: loggedUser._id,
    };

    const newBusStaff = await this.busStaffService.addNewDocument(busStaffData);

    if (!newBusStaff)
      throw new InternalServerErrorException([RESPONSE_MESSAGES.DB_FAILURE]);

    return { data: newBusStaff };
  }

  @ApiOperation({ summary: 'Update bus staff' })
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Permissions(PERMISSIONS.ADMIN, PERMISSIONS.SUPPORT, PERMISSIONS.AGENT)
  @Patch(':id')
  async updateBusStaff(
    @LoggedUser() loggedUser: ILoggedUser,
    @Param() pathParams: ObjectIDPathDTO,
    @Body() updateBusStaffDto: any,
  ) {
    const foundBusStaff = await this.busStaffService.findById(pathParams.id);

    const updatedBusStaff = await this.busStaffService.updateDocument({
      ...foundBusStaff,
      ...updateBusStaffDto,
      changed_by: loggedUser._id,
    });

    if (!updatedBusStaff)
      throw new InternalServerErrorException([RESPONSE_MESSAGES.DB_FAILURE]);

    return { data: updatedBusStaff };
  }
}
