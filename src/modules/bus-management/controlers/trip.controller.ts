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
import { BookingService } from '../services/booking.service';

@ApiTags('trip')
@Controller({ path: 'trip' })
export class TripController {
  constructor(
    private readonly tripService: TripService,
    private readonly bookingService: BookingService,
  ) {}

  @ApiOperation({
    summary: 'Get all trips with filters and pagination',
  })
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Permissions(PERMISSIONS.ADMIN, PERMISSIONS.SUPPORT, PERMISSIONS.AGENT)
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
    summary: 'Get all trips with public',
  })
  @Get('public')
  async filterPublicTrips(@Query() queryParams: any) {
    const createTripFilter = (query) => {
      const filter: any = {};

      if (query.from)
        filter.start_location = { $regex: new RegExp(query.from, 'i') };

      if (query.to) filter.destination = { $regex: new RegExp(query.to, 'i') };

      if (query.date) {
        // Convert the date string to a Date object
        const queryDate = new Date(query.date);

        // Set the time to 00:00:00 for the start of the day
        const startOfDay = new Date(queryDate);
        startOfDay.setHours(0, 0, 0, 0);

        // Set the time to 23:59:59 for the end of the day
        const endOfDay = new Date(queryDate);
        endOfDay.setHours(23, 59, 59, 999);

        filter.start_date = {
          $gte: startOfDay,
          $lte: endOfDay,
        };
      }

      return filter;
    };

    const filter = createTripFilter(queryParams);

    const foundTrips = await this.tripService.filterTripsWith(
      filter,
      queryParams.start || 0,
      queryParams.size || 0,
    );

    return foundTrips;
  }

  @ApiOperation({
    summary: 'Get single trip by id',
  })
  @Get(':id')
  async getSingleTrip(@Param() pathParams: ObjectIDPathDTO) {
    const foundTrip = await this.tripService.findById(pathParams.id);

    if (!foundTrip)
      throw new InternalServerErrorException([RESPONSE_MESSAGES.DB_FAILURE]);

    return { data: foundTrip };
  }

  @ApiOperation({ summary: 'Create new trip' })
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Permissions(PERMISSIONS.ADMIN, PERMISSIONS.SUPPORT, PERMISSIONS.AGENT)
  @Post()
  async createNewTrip(
    @Body() createTripDto: any,
    @LoggedUser() loggedUser: ILoggedUser,
  ) {
    const tripData: ITrip = {
      ...createTripDto,
      is_active: createTripDto.is_active ?? true,
      created_by: loggedUser._id,
    };

    const newTrip = await this.tripService.addNewDocument(tripData);

    if (!newTrip)
      throw new InternalServerErrorException([RESPONSE_MESSAGES.DB_FAILURE]);

    return { data: newTrip };
  }

  @ApiOperation({ summary: 'Update trip' })
  @Patch(':id')
  async updateTrip(
    @Param() pathParams: ObjectIDPathDTO,
    @Body() updateTripDto: any,
  ) {
    const foundTrip = await this.tripService.findById(pathParams.id);

    const updatedTrip = await this.tripService.updateDocument({
      ...foundTrip,
      ...updateTripDto,
      booked_seats: [
        ...(Array.isArray(foundTrip?.booked_seats)
          ? foundTrip.booked_seats
          : []),
        ...(Array.isArray(updateTripDto?.booked_seats)
          ? updateTripDto.booked_seats
          : []),
      ],
    });

    if (!updatedTrip)
      throw new InternalServerErrorException([RESPONSE_MESSAGES.DB_FAILURE]);

    return { data: updatedTrip };
  }

  @ApiOperation({ summary: 'Update trip and booking' })
  @Patch(':id')
  async updateTripAndBooking(
    @Param() pathParams: ObjectIDPathDTO,
    @Body() updateTripDto: any,
  ) {
    const foundTrip = await this.tripService.findById(pathParams.id);

    const updatedTrip = await this.tripService.updateDocument({
      ...foundTrip,
      ...updateTripDto,
      booked_seats: [
        ...(Array.isArray(foundTrip?.booked_seats)
          ? foundTrip.booked_seats
          : []),
        ...(Array.isArray(updateTripDto?.booked_seats)
          ? updateTripDto.booked_seats
          : []),
      ],
    });

    if (!updatedTrip)
      throw new InternalServerErrorException([RESPONSE_MESSAGES.DB_FAILURE]);

    // Update the booking with the new booked seats
    const updatedBooking = await this.bookingService.updateDocument({
      ...updateTripDto,
      trip_id: foundTrip._id,
      seats: updateTripDto.booked_seats,
    });

    if (!updatedBooking)
      throw new InternalServerErrorException([RESPONSE_MESSAGES.DB_FAILURE]);

    return { data: updatedTrip };
  }
}
