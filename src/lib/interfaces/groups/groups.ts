import {
  FILTER_CONTROL,
  FILTER_GROUP_CONNECTOR,
  FILTER_GROUP_SETTING,
  FILTER_GROUP_STATE_OPTIONS,
  PREDICTIVE_TYPE,
  SORTING_METHOD,
} from '@constant/groups/groups';
import { IBaseEntity } from '@interface/common/base-entity';
import { Types } from 'mongoose';

export interface IGroup extends IBaseEntity {
  name: string;
  description?: string;
  filter_groups?: IFilterGroup[];
  previous_filter_groups?: IFilterGroup[];
  predictive_settings?: IPredictiveSettings;
  skill_group?: Types.ObjectId;
}

//------------- filter group -----------------
export interface IFilterGroup {
  filter_control: FILTER_CONTROL;
  filter_group_title?: string;
  weight_value?: string;
  filter_settings?: IFilterGroupSetting[];
}

export interface IFilterGroupSetting {
  filter_group?: FILTER_GROUP_SETTING;
  filter_group_state?: FILTER_GROUP_STATE_OPTIONS;
  input_value?: string | number | Types.ObjectId[];
  connector?: FILTER_GROUP_CONNECTOR;
}

//------------- predictive settings -----------------
export interface PredictiveSettings {
  sorting_method?: SORTING_METHOD;
  is_show_feedback?: boolean;
  is_show_lead_preview?: boolean;
  dialing_start_before_feedback_end?: number;
  background_dialing_ratio?: number;
}

//when predictive_type && predictive_type === FIXED
type FixedTypeFields = PredictiveSettings & {
  predictive_type: PREDICTIVE_TYPE.FIXED;
  fixed_call_ratio_per_agent?: number;
  lead_upload_factors?: {
    lower_factor?: number;
    upper_factor?: number;
  };
};

//when predictive_type && predictive_type === DYNAMIC
type DynamicTypeFields = PredictiveSettings & {
  predictive_type: PREDICTIVE_TYPE.DYNAMIC;
  call_ratio?: {
    min_call_ratio?: number;
    max_call_ratio?: number;
  };
  drop_ratio_threshold?: {
    hard_drop_rate?: number;
    soft_drop_rate?: number;
    hard_ratio_increment?: number;
    soft_ratio_increment?: number;
  };
  optimal_drop_rate?: {
    hard_optimal_drop_rate?: number;
    soft_optimal_drop_rate?: number;
    optimal_ratio_increment?: number;
  };
};

export type IPredictiveSettings = FixedTypeFields | DynamicTypeFields;
