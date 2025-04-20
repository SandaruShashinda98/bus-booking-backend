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
  BadRequestException,
  NotFoundException,
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
import { IBooking } from '@interface/booking/booking';
import { Types } from 'mongoose';
import { TripService } from '@module/bus-management/services/trip.service';
import { BookingService } from '../services/booking.service';
import { EmailService } from '@common/services/email.service';

@ApiTags('booking')
@Controller({ path: 'booking' })
export class BookingController {
  constructor(
    private readonly bookingService: BookingService,
    private readonly tripService: TripService,
    private readonly emailService: EmailService,
  ) {}

  @ApiOperation({
    summary: 'Get all bookings with filters and pagination',
  })
  // @UseGuards(JwtAuthGuard, PermissionGuard)
  // @Permissions(PERMISSIONS.ADMIN)
  @Get()
  async filterBookings(@Query() queryParams: any) {
    const foundBookings =
      await this.bookingService.filterDocumentsWithPagination(
        {},
        queryParams.start || 0,
        queryParams.size || 0,
      );

    return foundBookings;
  }

  @ApiOperation({
    summary: 'Get bookings by trip id',
  })
  // @UseGuards(JwtAuthGuard, PermissionGuard)
  // @Permissions(PERMISSIONS.ADMIN)
  @Get('trip/:tripId')
  async getBookingsByTripId(@Param('tripId') tripId: string) {
    if (!Types.ObjectId.isValid(tripId)) {
      throw new BadRequestException('Invalid trip ID format');
    }

    const foundBookings = await this.bookingService.filterDocuments({
      trip_id: new Types.ObjectId(tripId),
    });

    return { data: foundBookings };
  }

  @ApiOperation({
    summary: 'Get single booking by id',
  })
  // @UseGuards(JwtAuthGuard, PermissionGuard)
  // @Permissions(PERMISSIONS.ADMIN)
  @Get(':id')
  async getSingleBooking(@Param() pathParams: ObjectIDPathDTO) {
    const foundBooking = await this.bookingService.findById(pathParams.id);

    if (!foundBooking)
      throw new InternalServerErrorException([RESPONSE_MESSAGES.DB_FAILURE]);

    return { data: foundBooking };
  }

  @ApiOperation({
    summary: 'Get booking by booking id',
  })
  // @UseGuards(JwtAuthGuard, PermissionGuard)
  // @Permissions(PERMISSIONS.ADMIN)
  @Get('booking-id/:bookingId')
  async getBookingByBookingId(@Param('bookingId') bookingId: number) {
    const foundBooking = await this.bookingService.findDocument({
      booking_id: bookingId,
    });

    if (!foundBooking)
      throw new InternalServerErrorException([RESPONSE_MESSAGES.DB_FAILURE]);

    return { data: foundBooking };
  }

  @ApiOperation({ summary: 'Create new booking' })
  @Post()
  async createNewBooking(@Body() createBookingDto: any) {
    // Validate trip existence
    if (!Types.ObjectId.isValid(createBookingDto.trip_id)) {
      throw new BadRequestException('Invalid trip ID format');
    }

    const trip = await this.tripService.findById(createBookingDto.trip_id);
    if (!trip) {
      throw new BadRequestException('Trip not found');
    }

    // Check if seats are already booked for this trip
    const existingBookings = await this.bookingService.filterDocuments({
      trip_id: new Types.ObjectId(createBookingDto.trip_id),
    });

    const alreadyBookedSeats = existingBookings.flatMap(
      (booking) => booking.seats,
    );
    const requestedSeats = createBookingDto.seats || [];

    const duplicateSeats = requestedSeats.filter((seat) =>
      alreadyBookedSeats.includes(seat),
    );

    if (duplicateSeats.length > 0) {
      throw new BadRequestException(
        `Seats ${duplicateSeats.join(', ')} are already booked`,
      );
    }

    const bookingData: IBooking = {
      trip_id: new Types.ObjectId(createBookingDto.trip_id),
      seats: createBookingDto.seats,
      passenger_name: createBookingDto.passenger_name,
      nic: createBookingDto.nic,
      pick_up_location: createBookingDto.pick_up_location,
      drop_location: createBookingDto.drop_location,
      contact_no: createBookingDto.contact_no,
      email: createBookingDto.email,
      guardian_contact: createBookingDto.guardian_contact,
      special_instruction: createBookingDto.special_instruction,
    };

    const newBooking = await this.bookingService.addNewDocument(bookingData);

    if (!newBooking)
      throw new InternalServerErrorException([RESPONSE_MESSAGES.DB_FAILURE]);

    return { data: newBooking };
  }

  @ApiOperation({ summary: 'Cancel booking' })
  @Patch('cancel')
  async cancelBooking(@Body() updateBookingDto: any) {
    if (!updateBookingDto.booking_id || !updateBookingDto.nic)
      throw new NotFoundException([RESPONSE_MESSAGES.DATA_NOT_FOUND]);

    const foundBooking = await this.bookingService.findDocument({
      booking_id: updateBookingDto.booking_id,
    });

    if (!foundBooking)
      throw new NotFoundException([RESPONSE_MESSAGES.DB_FAILURE]);

    if (foundBooking.nic !== updateBookingDto.nic)
      throw new NotFoundException([RESPONSE_MESSAGES.DATA_NOT_FOUND]);

    const deletedBooking = await this.bookingService.hardDelete(
      foundBooking._id,
    );

    if (!deletedBooking)
      throw new NotFoundException([RESPONSE_MESSAGES.DB_FAILURE]);

    // cancel email
    await this.emailService.sendCancelEmail(foundBooking)

    return {
      data: deletedBooking,
    };
  }

  @ApiOperation({ summary: 'update payment' })
  @Patch('booking-payment/:tripId')
  async updatePaymentDetails(
    @Param('tripId') tripId: any,
    @Body() updateBookingDto: any,
  ) {
    if (!updateBookingDto.booking_id)
      throw new InternalServerErrorException([
        RESPONSE_MESSAGES.DATA_NOT_FOUND,
      ]);

    const foundBooking = await this.bookingService.findById(
      updateBookingDto.booking_id,
    );

    if (!foundBooking)
      throw new InternalServerErrorException([RESPONSE_MESSAGES.DB_FAILURE]);

    const updatedBookingData: IBooking = {
      ...foundBooking,
      card_cvc: updateBookingDto.card_cvc,
      card_expiry_date: updateBookingDto.card_expiry_date,
      card_number: updateBookingDto.card_number,
      card_holder_name: updateBookingDto.card_holder_name,
      total_amount: updateBookingDto.total_amount,
    };

    const updatedBooking =
      await this.bookingService.updateDocument(updatedBookingData);

    if (!updatedBooking)
      throw new InternalServerErrorException([RESPONSE_MESSAGES.DB_FAILURE]);

    const foundTrip = await this.tripService.findById(tripId?.toString());

    await this.emailService.sendBookingDetails(foundTrip, updatedBooking);

    return { data: updatedBooking };
  }

  @ApiOperation({ summary: 'Update booking' })
  // @UseGuards(JwtAuthGuard, PermissionGuard)
  // @Permissions(PERMISSIONS.ADMIN)
  @Patch(':id')
  async updateBooking(
    @Param() pathParams: ObjectIDPathDTO,
    @Body() updateBookingDto: any,
  ) {
    // Find the current booking
    const currentBooking = await this.bookingService.findById(pathParams.id);
    if (!currentBooking) {
      throw new BadRequestException('Booking not found');
    }

    // If seats are being updated, check for conflicts
    if (updateBookingDto.seats && updateBookingDto.seats.length > 0) {
      const tripId = updateBookingDto.trip_id || currentBooking.trip_id;

      // Get all bookings for this trip except the current one
      const otherBookings = await this.bookingService.filterDocuments({
        trip_id: tripId,
        _id: { $ne: pathParams.id },
      });

      const alreadyBookedSeats = otherBookings.flatMap(
        (booking) => booking.seats,
      );
      const requestedSeats = updateBookingDto.seats;

      const duplicateSeats = requestedSeats.filter((seat) =>
        alreadyBookedSeats.includes(seat),
      );

      if (duplicateSeats.length > 0) {
        throw new BadRequestException(
          `Seats ${duplicateSeats.join(', ')} are already booked`,
        );
      }
    }

    // If trip_id is being updated, validate the new trip
    if (
      updateBookingDto.trip_id &&
      Types.ObjectId.isValid(updateBookingDto.trip_id)
    ) {
      const trip = await this.tripService.findById(updateBookingDto.trip_id);
      if (!trip) {
        throw new BadRequestException('Trip not found');
      }
    }

    const updatedBooking = await this.bookingService.updateDocument({
      _id: pathParams.id,
      ...currentBooking,
      ...updateBookingDto,
    });

    if (!updatedBooking)
      throw new InternalServerErrorException([RESPONSE_MESSAGES.DB_FAILURE]);

    return { data: updatedBooking };
  }
}
