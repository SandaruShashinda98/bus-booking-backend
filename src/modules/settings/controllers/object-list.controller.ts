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
} from '@nestjs/common';
import { ObjectIDPathDTO } from '@common/dto/object-id.path.dto';
import { RESPONSE_MESSAGES } from '@constant/common/responses';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { LoggedUser } from '@common/decorators/logged-user.decorator';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { ILoggedUser } from '@interface/authorization/user';
import { PermissionGuard } from '@common/guards/permission.guard';
import { PERMISSIONS } from '@constant/authorization/roles';
import { Permissions } from '@common/decorators/permissions.decorator';
import { ObjectListsDatabaseService } from '../services/object-list.database.service';
import {
  CreateObjectListDTO,
  UpdateObjectListDTO,
} from '@dto/settings/object-list-request.dto';
import { IObjectList } from '@interface/settings/object-list';
import { GetObjectListQueryDTO } from '@dto/settings/object-list-query-params.dto';
import {
  CreateObjectListResponseDTO,
  FilterObjectListResponseDTO,
  ObjectsResponseDTO,
} from '@dto/settings/object-list-response.dto';
import { countries } from '@meta-data/countries';
import { LogRequest } from '@common/decorators/log-request-response.decorator';
import { DuplicateException } from '@common/filters/duplicate-exception.filter';
import { SettingsService } from '../services/settings.service';
import { CommonSearchResponseDTO } from '@common/dto/common-fields.dto';

@ApiTags('object-list')
@Controller({ path: 'object-list' })
export class ObjectListController {
  constructor(
    private readonly objectListsDatabaseService: ObjectListsDatabaseService,
    private readonly settingsService: SettingsService,
  ) {}

  @ApiOperation({
    summary: 'Get all object lists with pagination',
  })
  @ApiResponse({ type: FilterObjectListResponseDTO })
  @UseGuards(JwtAuthGuard)
  @Permissions(PERMISSIONS.ADMIN)
  @Get()
  async filterObjectLists(@Query() queryParams: GetObjectListQueryDTO) {
    const filters = this.settingsService.getObjectListFilters(queryParams);

    const foundLists = await this.objectListsDatabaseService.filterObjectLists(
      filters,
      queryParams.start || 0,
      queryParams.size || 0,
    );

    return foundLists;
  }

  @ApiOperation({
    summary: 'Get all countries',
  })
  @UseGuards(JwtAuthGuard)
  @Permissions(PERMISSIONS.ADMIN)
  @Get('countries')
  async getCountries() {
    return { data: countries, count: countries.length };
  }

  @ApiOperation({
    summary: 'Get All Desks with filters and pagination - for search',
  })
  @ApiResponse({ type: CommonSearchResponseDTO })
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Permissions(PERMISSIONS.ADMIN)
  @Get('search')
  async filterSearchDesk(@Query() queryParams: GetObjectListQueryDTO) {
    const filters = this.settingsService.getObjectListFilters(queryParams);

    const foundObjectLists =
      await this.objectListsDatabaseService.filterSearchData(
        filters,
        queryParams.start || 0,
        queryParams.size || 0,
        '$name',
      );

    return foundObjectLists;
  }

  @ApiOperation({
    summary: 'Get all object lists with pagination',
  })
  @ApiResponse({ type: ObjectsResponseDTO })
  @UseGuards(JwtAuthGuard)
  @Permissions(PERMISSIONS.ADMIN)
  @Get(':id/objects')
  async getObjectsInsideSingleList(@Param() pathParams: ObjectIDPathDTO) {
    const foundObjectList = await this.objectListsDatabaseService.findById(
      pathParams.id,
    );

    if (!foundObjectList)
      throw new NotFoundException([RESPONSE_MESSAGES.DATA_NOT_FOUND]);

    const foundObjects =
      this.settingsService.getObjectsInsideSingleList(foundObjectList);

    return { data: foundObjects };
  }

  @ApiOperation({
    summary: 'Get single object-list by id',
  })
  @ApiResponse({ type: CreateObjectListResponseDTO })
  @UseGuards(JwtAuthGuard)
  @Permissions(PERMISSIONS.ADMIN)
  @Get(':id')
  async getSingleObjectList(@Param() pathParams: ObjectIDPathDTO) {
    const foundObjectList = await this.objectListsDatabaseService.findById(
      pathParams.id,
    );

    if (!foundObjectList)
      throw new NotFoundException([RESPONSE_MESSAGES.DATA_NOT_FOUND]);

    return { data: foundObjectList };
  }

  @ApiOperation({ summary: 'Create new object-list' })
  @ApiResponse({ type: CreateObjectListResponseDTO })
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Permissions(PERMISSIONS.ADMIN)
  @LogRequest('object-list -> createObjectList')
  @Post()
  async createObjectList(
    @Body() createObjectListDto: CreateObjectListDTO,
    @LoggedUser() loggedUser: ILoggedUser,
  ) {
    const foundDuplicates = await this.objectListsDatabaseService.findDocument({
      name: createObjectListDto.name,
      is_delete: false,
    });

    if (foundDuplicates)
      throw new DuplicateException([RESPONSE_MESSAGES.DUPLICATE_OBJECT_LIST]);

    //TODO: check if the leads object_ids are valid

    const objectListData: Partial<IObjectList> = {
      ...createObjectListDto,
      is_active: createObjectListDto.is_active ?? true,
      is_clone: createObjectListDto.is_clone ?? false,
    };

    const newObjectList =
      await this.objectListsDatabaseService.createNewObjectList(
        objectListData,
        loggedUser,
      );

    if (!newObjectList)
      throw new InternalServerErrorException([RESPONSE_MESSAGES.DB_FAILURE]);

    return { data: newObjectList };
  }

  @ApiOperation({ summary: 'Update object list' })
  @ApiResponse({ type: CreateObjectListResponseDTO })
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Permissions(PERMISSIONS.ADMIN)
  @LogRequest('object-list -> updateObjectList')
  @Patch(':id')
  async updateObjectList(
    @LoggedUser() loggedUser: ILoggedUser,
    @Param() pathParams: ObjectIDPathDTO,
    @Body() updateObjectListDto: UpdateObjectListDTO,
  ) {
    const foundObjectList = await this.objectListsDatabaseService.findById(
      pathParams.id,
    );

    if (!foundObjectList)
      throw new NotFoundException([RESPONSE_MESSAGES.DATA_NOT_FOUND]);

    //TODO: check if the leads object_ids are valid

    const updateData: IObjectList = {
      ...foundObjectList,
      ...updateObjectListDto,
    };

    const updatedList =
      await this.objectListsDatabaseService.findObjectListByIdAndUpdate(
        foundObjectList._id,
        updateData,
        loggedUser,
      );

    if (!updatedList)
      throw new InternalServerErrorException([RESPONSE_MESSAGES.DB_FAILURE]);

    return { data: updatedList };
  }
}
