import {
  Body,
  Controller,
  Get,
  InternalServerErrorException,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CallsService } from '../services/calls.service';
import { CallsDatabaseService } from '../services/calls.database.service';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { PERMISSIONS } from '@constant/authorization/roles';
import { Permissions } from '@common/decorators/permissions.decorator';
import { LogRequest } from '@common/decorators/log-request-response.decorator';
import { LoggedUser } from '@common/decorators/logged-user.decorator';
import { ILoggedUser } from '@interface/authorization/user';
import { RESPONSE_MESSAGES } from '@constant/common/responses';
import { ObjectIDPathDTO } from '@common/dto/object-id.path.dto';
import {
  CallsRequestQueryDto,
  InitiateCallRequestBody,
  UpdateCallDto,
} from '@dto/workspace/calls-request.dto';
import { PermissionGuard } from '@common/guards/permission.guard';

@ApiTags('workspace/calls')
@Controller({ path: 'workspace/calls' })
export class CallsController {
  constructor(
    private readonly callsService: CallsService,
    private readonly callsDatabaseService: CallsDatabaseService,
  ) {}
  @ApiOperation({
    summary: 'Get all calls',
  })
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Permissions(PERMISSIONS.ADMIN, PERMISSIONS.AGENT, PERMISSIONS.SUPPORT)
  @Get()
  async filterCalls(@Query() queryParams: CallsRequestQueryDto) {
    const filters = this.callsService.getCallsFilters(queryParams);

    const foundCalls = await this.callsDatabaseService.filterCalls(
      filters,
      queryParams.start ?? 0,
      queryParams.size ?? 0,
    );

    return foundCalls;
  }

  @ApiOperation({
    summary: 'create single call',
  })
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Permissions(PERMISSIONS.ADMIN, PERMISSIONS.AGENT, PERMISSIONS.SUPPORT)
  @Post()
  @LogRequest('calls-> initiateCall')
  async initiateCall(
    @Body() initialCallRequestBody: InitiateCallRequestBody,
    @LoggedUser() loggedUser: ILoggedUser,
  ) {
    //TODO add validation for call_id attribute if necessary

    const initiatedCall = await this.callsDatabaseService.initiateNewCall(
      initialCallRequestBody,
      loggedUser,
    );

    if (!initiatedCall)
      throw new InternalServerErrorException([RESPONSE_MESSAGES.DB_FAILURE]);

    return { data: initiatedCall };
  }

  @ApiOperation({
    summary: 'update call data',
  })
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Permissions(PERMISSIONS.ADMIN, PERMISSIONS.AGENT, PERMISSIONS.SUPPORT)
  @Patch(':id')
  @LogRequest('calls -> updateCallData')
  async updateCallData(
    @LoggedUser() loggedUser: ILoggedUser,
    @Param() pathParams: ObjectIDPathDTO,
    @Body() updateCallDto: UpdateCallDto,
  ) {
    const foundCall = await this.callsDatabaseService.findById(pathParams.id);

    if (!foundCall)
      throw new NotFoundException([RESPONSE_MESSAGES.DATA_NOT_FOUND]);

    const updatedCall = await this.callsDatabaseService.findCallByIdAndUpdate(
      pathParams.id,
      updateCallDto,
      loggedUser,
    );

    if (!updateCallDto)
      throw new InternalServerErrorException([RESPONSE_MESSAGES.DB_FAILURE]);

    return { data: updatedCall };
  }
}
