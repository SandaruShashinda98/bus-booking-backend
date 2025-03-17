import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  UseGuards,
  InternalServerErrorException,
} from '@nestjs/common';
import { ObjectIDPathDTO } from '@common/dto/object-id.path.dto';
import { RESPONSE_MESSAGES } from '@constant/common/responses';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { LoggedUser } from '@common/decorators/logged-user.decorator';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { ILoggedUser } from '@interface/authorization/user';
import { Types } from 'mongoose';
import { Permissions } from '@common/decorators/permissions.decorator';
import { PermissionGuard } from '@common/guards/permission.guard';
import { PERMISSIONS } from '@constant/authorization/roles';
import { LogRequest } from '@common/decorators/log-request-response.decorator';
import { DuplicateException } from '@common/filters/duplicate-exception.filter';
import { IpACLDatabaseService } from '../services/ip-acl.database.service';
import { SettingsService } from '../services/settings.service';
import { IIpACL } from '@interface/settings/general-settings';
import { CreateIpDTO, UpdateIpDTO } from '@dto/settings/ip-acl-request.dto';
import { GetIpQueryDTO } from '@dto/settings/ip-acl-query-params.dto';

@ApiTags('ip-acl')
@Controller({ path: 'ip-acl' })
export class IpACLController {
  constructor(
    private readonly ipACLDatabaseService: IpACLDatabaseService,
    private readonly settingsService: SettingsService,
  ) {}

  @ApiOperation({
    summary: 'Get all ip-acls with filters and pagination',
  })
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Permissions(PERMISSIONS.ADMIN)
  @LogRequest('ip-acl -> filterIpACL')
  @Post('list')
  async filterIpACL(@Body() queryParams: GetIpQueryDTO) {
    const filters = this.settingsService.getIpACLFilters(queryParams);

    const foundIps =
      await this.ipACLDatabaseService.filterDocumentsWithPagination(
        filters,
        queryParams.start || 0,
        queryParams.size || 0,
      );

    return foundIps;
  }

  @ApiOperation({
    summary: 'Get single ip-acl by id',
  })
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Permissions(PERMISSIONS.ADMIN)
  @Get(':id')
  async getSingleIpACL(@Param() pathParams: ObjectIDPathDTO) {
    const foundIpACL = await this.ipACLDatabaseService.findById(pathParams.id);

    if (!foundIpACL)
      throw new InternalServerErrorException([RESPONSE_MESSAGES.DB_FAILURE]);

    return { data: foundIpACL };
  }

  @ApiOperation({ summary: 'Create new Ip ACL' })
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Permissions(PERMISSIONS.ADMIN)
  @LogRequest('ip-acl -> createIpACl')
  @Post()
  async createIpACl(
    @Body() createDto: CreateIpDTO,
    @LoggedUser() loggedUser: ILoggedUser,
  ) {
    const foundDuplicates = await this.ipACLDatabaseService.findDocument({
      ip_address: createDto.ip_address,
      is_delete: false,
    });

    if (foundDuplicates)
      throw new DuplicateException([RESPONSE_MESSAGES.DUPLICATE_IP]);

    const createData: Partial<IIpACL> = {
      ip_address: createDto.ip_address,
      description: createDto?.description,
      is_active: createDto.is_active ?? true,
    };

    const newIpACL = await this.ipACLDatabaseService.createNewIpACL(
      createData,
      loggedUser,
    );

    if (!newIpACL)
      throw new InternalServerErrorException([RESPONSE_MESSAGES.DB_FAILURE]);

    return { data: newIpACL };
  }

  @ApiOperation({ summary: 'Update ip-acl' })
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Permissions(PERMISSIONS.ADMIN)
  @LogRequest('ip-acl -> updateIpACL')
  @Patch(':id')
  async updateIpACL(
    @LoggedUser() loggedUser: ILoggedUser,
    @Param() pathParams: ObjectIDPathDTO,
    @Body() updateDto: UpdateIpDTO,
  ) {
    const foundDuplicates = await this.ipACLDatabaseService.findDocument({
      ip_address: updateDto.ip_address,
      _id: { $ne: new Types.ObjectId(pathParams.id) },
      is_delete: false,
    });

    if (foundDuplicates)
      throw new DuplicateException([RESPONSE_MESSAGES.DUPLICATE_IP]);

    const updatedData = await this.ipACLDatabaseService.findIpACLByIdAndUpdate(
      new Types.ObjectId(pathParams.id),
      updateDto,
      loggedUser,
    );

    if (!updatedData)
      throw new InternalServerErrorException([RESPONSE_MESSAGES.DB_FAILURE]);

    return { data: updatedData };
  }
}
