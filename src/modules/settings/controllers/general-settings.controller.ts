import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  UnprocessableEntityException,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { LoggedUser } from '@common/decorators/logged-user.decorator';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { ILoggedUser } from '@interface/authorization/user';
import { PermissionGuard } from '@common/guards/permission.guard';
import { PERMISSIONS } from '@constant/authorization/roles';
import { Permissions } from '@common/decorators/permissions.decorator';
import { LogRequest } from '@common/decorators/log-request-response.decorator';
import { GeneralSettingsDatabaseService } from '../services/general-settings.database.service';
import { RESPONSE_MESSAGES } from '@constant/common/responses';
import { SettingsRequestDTO } from '@dto/settings/general-settings-request.dto';

@ApiTags('general-settings')
@Controller({ path: 'general-settings' })
export class GeneralSettingsController {
  constructor(
    private readonly generalSettingsDatabaseService: GeneralSettingsDatabaseService,
  ) {}

  @ApiOperation({
    summary: 'Get general settings data',
  })
  @UseGuards(JwtAuthGuard)
  @Permissions(PERMISSIONS.ADMIN)
  @Get()
  async getGeneralSettingsData() {
    const foundSettings =
      await this.generalSettingsDatabaseService.findDocument();

    return { data: foundSettings };
  }

  @ApiOperation({ summary: 'Create or update general settings' })
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Permissions(PERMISSIONS.ADMIN)
  @LogRequest('object-list -> createOrUpdateGeneralSettings')
  @Post()
  async createOrUpdateGeneralSettings(
    @Body() settingsDto: SettingsRequestDTO,
    @LoggedUser() loggedUser: ILoggedUser,
  ) {
    const foundSettings =
      await this.generalSettingsDatabaseService.findDocument();

    const savedSettings = foundSettings
      ? await this.generalSettingsDatabaseService.updateSettings(
          foundSettings._id,
          {
            ...foundSettings,
            ...settingsDto,
          },
          loggedUser,
        )
      : await this.generalSettingsDatabaseService.createSettings(
          settingsDto,
          loggedUser,
        );

    if (!savedSettings)
      throw new UnprocessableEntityException([RESPONSE_MESSAGES.DB_FAILURE]);

    return { data: savedSettings };
  }
}
