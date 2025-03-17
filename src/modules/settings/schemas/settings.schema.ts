import { BaseEntitySchemaContent } from '@common/schemas/base-entity.model';
import { DB_COLLECTION_NAMES } from '@constant/common/db-collection-names';
import {
  DIGITS_TO_SHOW,
  TIME_ZONES,
  WEEK_START,
} from '@constant/settings/settings';
import {
  IGeneralSettings,
  ISettings,
} from '@interface/settings/general-settings';
import { Document, model, Schema } from 'mongoose';

export type ISettingsModel = ISettings & Document;

const SGeneralSettings = new Schema<IGeneralSettings>({
  is_phone_number_masked: {
    type: Boolean,
    default: false,
  },

  digits_to_show: {
    enum: DIGITS_TO_SHOW,
    type: String,
  },

  digits_counts_to_display: {
    type: Number,
  },

  time_zones: {
    enum: TIME_ZONES,
    type: String,
    default: TIME_ZONES.UTC,
  },

  week_start: {
    enum: WEEK_START,
    type: String,
    default: WEEK_START.MONDAY,
  },
});

const SettingsSchema = new Schema<ISettingsModel>({
  ...BaseEntitySchemaContent,

  general_settings: SGeneralSettings,

  is_ip_acl_enabled: {
    type: Boolean,
    default: false,
  },
});

const SettingsModel = model<ISettingsModel>(
  DB_COLLECTION_NAMES.SETTINGS,
  SettingsSchema,
);
export default SettingsModel;
export { SettingsSchema };
