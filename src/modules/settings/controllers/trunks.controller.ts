import { Permissions } from '@common/decorators/permissions.decorator';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { PERMISSIONS } from '@constant/authorization/roles';
import {
  CreateTrunkRequestBodyDto,
  GetTrunksFilterQuery,
  UpdateTrunkRequestBodyDto,
} from '@dto/settings/trunks-request.dto';
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
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { TrunksService } from '../services/trunks.service';
import { TrunksDatabaseService } from '../services/trunks.database.service';
import { LogRequest } from '@common/decorators/log-request-response.decorator';
import { RESPONSE_MESSAGES } from '@constant/common/responses';
import { ILoggedUser } from '@interface/authorization/user';
import { LoggedUser } from '@common/decorators/logged-user.decorator';
import { ObjectIDPathDTO } from '@common/dto/object-id.path.dto';
import { DuplicateException } from '@common/filters/duplicate-exception.filter';

@ApiTags('trunks')
@Controller({ path: 'trunks' })
export class TrunksController {
  constructor(
    private readonly trunksDatabaseService: TrunksDatabaseService,
    private readonly trunksService: TrunksService,
  ) {}

  @ApiOperation({
    summary: 'Get all trunks with pagination',
  })
  @UseGuards(JwtAuthGuard)
  @Permissions(PERMISSIONS.ADMIN)
  @Get()
  async filterTrunks(@Query() queryParams: GetTrunksFilterQuery) {
    const filters = this.trunksService.getTrunksFilters(queryParams);

    const foundList = await this.trunksDatabaseService.filterTrunks(
      filters,
      queryParams.start ?? 0,
      queryParams.size ?? 0,
    );
    return foundList;
  }

  @ApiOperation({
    summary: 'create single trunk',
  })
  @UseGuards(JwtAuthGuard)
  @Permissions(PERMISSIONS.ADMIN)
  @Post()
  @LogRequest('trunks -> createTrunk')
  async createTrunk(
    @Body() createTrunkRequestBodyDto: CreateTrunkRequestBodyDto,
    @LoggedUser() loggedUser: ILoggedUser,
  ) {
    const trunkWithExistingNameFilter =
      this.trunksService.getTrunkFilterForName(
        createTrunkRequestBodyDto.name,
      );

    const trunkWithExistingName = await  this.trunksDatabaseService.findDocument(trunkWithExistingNameFilter)

    if (trunkWithExistingName)
      throw new DuplicateException([RESPONSE_MESSAGES.DUPLICATE_TRUNK]);
    // This is done assuming the uri is generated from the frontend

    const newTrunk = await this.trunksDatabaseService.createNewTrunk(
      createTrunkRequestBodyDto,
      loggedUser,
    );

    if (!newTrunk)
      throw new InternalServerErrorException([RESPONSE_MESSAGES.DB_FAILURE]);

    return { data: newTrunk };
  }

  @ApiOperation({
    summary: 'Modify single trunk',
  })
  @UseGuards(JwtAuthGuard)
  @Permissions(PERMISSIONS.ADMIN)
  @LogRequest('trunks -> updateTrunk')
  @Patch(':id')
  async updateTrunk(
    @Body() updateTrunkRequestBodyDto: UpdateTrunkRequestBodyDto,
    @Param() pathParams: ObjectIDPathDTO,
    @LoggedUser() loggedUser: ILoggedUser,
  ) {
    const updateTrunk = await this.trunksDatabaseService.updateTrunkData(
      pathParams.id,
      updateTrunkRequestBodyDto,
      loggedUser,
    );

    if (!updateTrunk)
      throw new InternalServerErrorException([RESPONSE_MESSAGES.DB_FAILURE]);

    if (UpdateTrunkRequestBodyDto.name) {
      const existingNameTrunkFilter = this.trunksService.getTrunkFilterForName(
        updateTrunkRequestBodyDto.name,
        pathParams.id,
      );

      const existingNameTrunk = await this.trunksDatabaseService.findDocument(
        existingNameTrunkFilter,
      );

      if (existingNameTrunk)
        throw new DuplicateException([RESPONSE_MESSAGES.DUPLICATE_TRUNK]);
    }

    return { data: updateTrunk };
  }

  @ApiOperation({
    summary: 'Get Single Trunk Data',
  })
  @Permissions(PERMISSIONS.ADMIN)
  @Get(':id')
  async getSingleTrunkData(@Param() pathParams: ObjectIDPathDTO) {
    const foundData = await this.trunksDatabaseService.findById(pathParams.id);

    if (!foundData)
      throw new NotFoundException([RESPONSE_MESSAGES.DATA_NOT_FOUND]);

    return { data: foundData };
  }
}
