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
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { LoggedUser } from '@common/decorators/logged-user.decorator';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { ILoggedUser } from '@interface/authorization/user';
import { Types } from 'mongoose';
import { ClockOutReasonDatabaseService } from '../services/clock-out-reason.database.service';
import { GetClockOutReasonQueryDTO } from '@dto/references/clock-out-query-param';
import {
  CreateClockOutReasonDTO,
  EditClockOutReasonDTO,
} from '@dto/references/clock-out-request.dto';
import { IClockOutReason } from '@interface/references/reference';
import {
  CreateClockOutReasonResponseDTO,
  FilterReasonResponseDTO,
  UpdateReasonResponseDTO,
} from '@dto/references/clock-out-response.dto';
import { Permissions } from '@common/decorators/permissions.decorator';
import { ReferenceService } from '../services/reference.service';
import { PermissionGuard } from '@common/guards/permission.guard';
import { PERMISSIONS } from '@constant/authorization/roles';
import { LogRequest } from '@common/decorators/log-request-response.decorator';
import { DuplicateException } from '@common/filters/duplicate-exception.filter';
import { CommonSearchResponseDTO } from '@common/dto/common-fields.dto';

@ApiTags('clock-out-reasons')
@Controller({ path: 'clock-out-reasons' })
export class ClockOutReasonsController {
  constructor(
    private readonly clockOutReasonDatabaseService: ClockOutReasonDatabaseService,
    private readonly referenceService: ReferenceService,
  ) {}

  @ApiOperation({
    summary: 'Get all clock-out reasons with filters and pagination',
  })
  @ApiResponse({ type: FilterReasonResponseDTO })
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Permissions(PERMISSIONS.ADMIN)
  @Get()
  async filterClockOutReasons(@Query() queryParams: GetClockOutReasonQueryDTO) {
    const filters = this.referenceService.getClockOutFilters(queryParams);

    const foundReasons =
      await this.clockOutReasonDatabaseService.filterDocumentsWithPagination(
        filters,
        queryParams.start || 0,
        queryParams.size || 0,
      );

    return foundReasons;
  }

  @ApiOperation({
    summary: 'Get all clock-out reasons - for search',
  })
  @ApiResponse({ type: CommonSearchResponseDTO })
  @UseGuards(JwtAuthGuard)
  @Permissions(PERMISSIONS.ADMIN)
  @Get('search')
  async filterSearchRoles(@Query() queryParams: GetClockOutReasonQueryDTO) {
    const filters = this.referenceService.getClockOutFilters(queryParams);

    const foundReasons =
      await this.clockOutReasonDatabaseService.filterSearchData(
        filters,
        queryParams.start || 0,
        queryParams.size || 0,
        '$reason',
      );

    return foundReasons;
  }

  @ApiOperation({
    summary: 'Get single clock-out reason by id',
  })
  @ApiResponse({ type: CreateClockOutReasonResponseDTO })
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Permissions(PERMISSIONS.ADMIN)
  @Get(':id')
  async getSingleClockOutReason(@Param() pathParams: ObjectIDPathDTO) {
    const foundReason = await this.clockOutReasonDatabaseService.findById(
      pathParams.id,
    );

    if (!foundReason)
      throw new InternalServerErrorException([RESPONSE_MESSAGES.DB_FAILURE]);

    return { data: foundReason };
  }

  @ApiOperation({ summary: 'Create new clock-out reason' })
  @ApiResponse({ type: CreateClockOutReasonResponseDTO })
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Permissions(PERMISSIONS.ADMIN)
  @LogRequest('clock-out-reasons -> createClockOutReason')
  @Post()
  async createClockOutReason(
    @Body() createReasonDto: CreateClockOutReasonDTO,
    @LoggedUser() loggedUser: ILoggedUser,
  ) {
    const foundDuplicates =
      await this.clockOutReasonDatabaseService.findDocument({
        reason: createReasonDto.reason,
        is_delete: false,
      });

    if (foundDuplicates)
      throw new DuplicateException([RESPONSE_MESSAGES.DUPLICATE_CLOCK_OUT]);

    const reasonData: Partial<IClockOutReason> = {
      reason: createReasonDto.reason,
      is_active: createReasonDto.is_active ?? true,
    };

    const newReason =
      await this.clockOutReasonDatabaseService.createNewClockOutReason(
        reasonData,
        loggedUser,
      );

    if (!newReason)
      throw new InternalServerErrorException([RESPONSE_MESSAGES.DB_FAILURE]);

    return { data: newReason };
  }

  @ApiOperation({ summary: 'Update clock-out reason' })
  @ApiResponse({ type: UpdateReasonResponseDTO })
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Permissions(PERMISSIONS.ADMIN)
  @LogRequest('clock-out-reasons -> updateClockOutReason')
  @Patch(':id')
  async updateClockOutReason(
    @LoggedUser() loggedUser: ILoggedUser,
    @Param() pathParams: ObjectIDPathDTO,
    @Body() updateReasonDto: EditClockOutReasonDTO,
  ) {
    const foundDuplicates =
      await this.clockOutReasonDatabaseService.findDocument({
        reason: updateReasonDto.reason,
        _id: { $ne: new Types.ObjectId(pathParams.id) },
        is_delete: false,
      });

    if (foundDuplicates)
      throw new DuplicateException([RESPONSE_MESSAGES.DUPLICATE_CLOCK_OUT]);

    const updatedReason =
      await this.clockOutReasonDatabaseService.findClockOutReasonByIdAndUpdate(
        new Types.ObjectId(pathParams.id),
        updateReasonDto,
        loggedUser,
      );

    if (!updatedReason)
      throw new InternalServerErrorException([RESPONSE_MESSAGES.DB_FAILURE]);

    return { data: updatedReason };
  }
}
