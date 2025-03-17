import { ACTIVE_STATE } from '@constant/authorization/user';
import {
  DIGITS_TO_SHOW,
  TIME_ZONES,
  WEEK_START,
} from '@constant/settings/settings';
import { IBaseEntity } from '@interface/common/base-entity';

export interface IGeneralSettings {
  is_phone_number_masked: boolean;
  digits_to_show: DIGITS_TO_SHOW;
  digits_counts_to_display: number;

  time_zones: TIME_ZONES;
  week_start: WEEK_START;
}

export interface ISettings extends IBaseEntity {
  general_settings: IGeneralSettings;
  is_ip_acl_enabled: boolean;
}

export interface IIpACL extends IBaseEntity {
  ip_address: string;
  description: string;
}

export interface IIpACLFilterCriteria {
  is_delete?: boolean;
  ip_address?: string;
  description?: string;
  active_state?: ACTIVE_STATE;
  _id?: string;
}
