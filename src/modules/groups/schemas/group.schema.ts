import { BaseEntitySchemaContent } from '@common/schemas/base-entity.model';
import { DB_COLLECTION_NAMES } from '@constant/common/db-collection-names';
import { PREDICTIVE_TYPE, SORTING_METHOD } from '@constant/groups/groups';
import { IGroup } from '@interface/groups/groups';
import { Document, model, Schema } from 'mongoose';

export type IGroupModel = IGroup & Document;

const FilterGroupSchema = new Schema({
  filter_control: {
    type: String,
    required: true,
  },
  filter_group_title: {
    type: String,
  },
  weight_value: {
    type: String,
  },
  filter_settings: [
    {
      filter_group: {
        type: String,
      },
      filter_group_state: {
        type: String,
      },
      input_value: {
        type: Schema.Types.Mixed,
      },
      connector: {
        type: String,
      },
    },
  ],
});

const PredictiveSettingsSchema = new Schema({
  predictive_type: {
    type: String,
    enum: PREDICTIVE_TYPE,
  },
  sorting_method: {
    type: String,
    enum: SORTING_METHOD,
  },
  is_show_feedback: {
    type: Boolean,
    default: false,
  },
  is_show_lead_preview: {
    type: Boolean,
    default: false,
  },
  dialing_start_before_feedback_end: {
    type: Number,
  },
  background_dialing_ratio: {
    type: Number,
  },

  // predictive_type === FIXED
  fixed_call_ratio_per_agent: {
    type: Number,
  },
  lead_upload_factors: {
    lower_factor: {
      type: Number,
    },
    upper_factor: {
      type: Number,
    },
  },

  // predictive_type === DYNAMIC
  call_ratio: {
    min_call_ratio: {
      type: Number,
    },
    max_call_ratio: {
      type: Number,
    },
  },
  drop_ratio_threshold: {
    hard_drop_rate: {
      type: Number,
    },
    soft_drop_rate: {
      type: Number,
    },
    hard_ratio_increment: {
      type: Number,
    },
    soft_ratio_increment: {
      type: Number,
    },
  },
  optimal_drop_rate: {
    hard_optimal_drop_rate: {
      type: Number,
    },
    soft_optimal_drop_rate: {
      type: Number,
    },
    optimal_ratio_increment: {
      type: Number,
    },
  },
});

const GroupSchema = new Schema<IGroupModel>({
  ...BaseEntitySchemaContent,
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },

  filter_groups: [FilterGroupSchema],

  previous_filter_groups: [FilterGroupSchema],

  predictive_settings: PredictiveSettingsSchema,

  skill_group: {
    type: Schema.ObjectId,
    ref: DB_COLLECTION_NAMES.SKILL_GROUPS,
  },
});

const GroupModel = model<IGroupModel>(DB_COLLECTION_NAMES.GROUPS, GroupSchema);
export default GroupModel;
export { GroupSchema };
