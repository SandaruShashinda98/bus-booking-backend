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
import { ITrip } from '@interface/booking/booking';
import { TripService } from '../services/trip.service';

@ApiTags('trip')
@Controller({ path: 'trip' })
export class TripController {
  constructor(private readonly tripService: TripService) {}

  @ApiOperation({
    summary: 'Get all trips with filters and pagination',
  })
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Permissions(PERMISSIONS.ADMIN)
  @Get()
  async filterTrips(@Query() queryParams: any) {
    const foundTrips = await this.tripService.filterDocumentsWithPagination(
      {},
      queryParams.start || 0,
      queryParams.size || 0,
    );

    return foundTrips;
  }

  @ApiOperation({
    summary: 'Get single trip by id',
  })
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Permissions(PERMISSIONS.ADMIN)
  @Get(':id')
  async getSingleTrip(@Param() pathParams: ObjectIDPathDTO) {
    const foundTrip = await this.tripService.findById(pathParams.id);

    if (!foundTrip)
      throw new InternalServerErrorException([RESPONSE_MESSAGES.DB_FAILURE]);

    return { data: foundTrip };
  }

  @ApiOperation({ summary: 'Create new trip' })
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Permissions(PERMISSIONS.ADMIN)
  @Post()
  async createNewTrip(
    @Body() createTripDto: any,
    @LoggedUser() loggedUser: ILoggedUser,
  ) {
    const tripData: ITrip = {
      start_location: createTripDto.start_location,
      destination: createTripDto.destination,
      start_date: createTripDto.start_date,
      end_date: createTripDto.end_date,
      status: createTripDto.status,
      is_active: createTripDto.is_active ?? true,
      created_by: loggedUser._id,
    };

    const newTrip = await this.tripService.addNewDocument(tripData);

    if (!newTrip)
      throw new InternalServerErrorException([RESPONSE_MESSAGES.DB_FAILURE]);

    return { data: newTrip };
  }

  @ApiOperation({ summary: 'Update trip' })
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Permissions(PERMISSIONS.ADMIN)
  @Patch(':id')
  async updateTrip(
    @LoggedUser() loggedUser: ILoggedUser,
    @Param() pathParams: ObjectIDPathDTO,
    @Body() updateTripDto: any,
  ) {
    const foundTrip = await this.tripService.findById(pathParams.id);

    const updatedTrip = await this.tripService.updateDocument({
      ...foundTrip,
      ...updateTripDto,
      changed_by: loggedUser._id,
    });

    if (!updatedTrip)
      throw new InternalServerErrorException([RESPONSE_MESSAGES.DB_FAILURE]);

    return { data: updatedTrip };
  }
}
