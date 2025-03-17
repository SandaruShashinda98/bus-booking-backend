import { BaseEntitySchemaContent } from '@common/schemas/base-entity.model';
import { DB_COLLECTION_NAMES } from '@constant/common/db-collection-names';
import {
  AVAILABILITY_STATUS,
  HLR_STATUS,
  LEAD_STATE,
  TRI_STATUS,
} from '@constant/leads/leads';
import { ILeadFilter } from '@interface/leads/leads';
import { Document, model, Schema } from 'mongoose';

export type ILeadEntityFilterModel = ILeadFilter & Document;

const LeadEntityFilterSchema = new Schema<ILeadEntityFilterModel>({
  ...BaseEntitySchemaContent,

  filter_name: {
    type: String,
  },
  count: {
    type: Number,
  },

  //--------------lead details--------------
  lead_details: {
    lead_id: {
      type: Number,
    },
    first_name: {
      type: String,
    },
    last_name: {
      type: String,
    },
    phone_number: {
      type: String,
    },
    phone_number_normalized: {
      type: String,
    },
    secondary_phone: {
      type: String,
    },
    email: {
      type: String,
    },
    age: {
      type: Number,
    },
    education: {
      type: String,
    },
    address: {
      type: String,
    },
    city: {
      type: String,
    },
    state: {
      type: String,
    },
    country: {
      type: [Schema.Types.Mixed],
      default: undefined,
    },
    time_zone: {
      type: [Schema.Types.Mixed],
      default: undefined,
    },
  },

  //--------------campaigns and engagement details--------------
  campaigns_and_engagement_details: {
    campaigns: {
      type: [Schema.Types.ObjectId],
      default: undefined,
    },
    status: {
      type: [Schema.Types.Mixed],
      default: undefined,
    },
    sub_status: {
      type: [Schema.Types.Mixed],
      default: undefined,
    },
    availability: {
      type: [String],
      enum: AVAILABILITY_STATUS,
      default: undefined,
    },
    hlr: {
      type: [String],
      enum: HLR_STATUS,
      default: undefined,
    },
    lead_state: {
      type: [String],
      enum: LEAD_STATE,
      default: undefined,
    },
    weight: {
      type: Schema.Types.Mixed,
    },
    calls: {
      type: Schema.Types.Mixed,
    },
    funnel: {
      type: Schema.Types.Mixed,
    },
    tag: {
      type: Schema.Types.Mixed,
    },
    original_identifier: {
      type: Schema.Types.Mixed,
    },
    assign_to: {
      type: [Schema.Types.Mixed],
      default: undefined,
    },
    start_lead_period: {
      type: Date,
    },
    end_lead_period: {
      type: Date,
    },
    call_after: {
      type: Schema.Types.Mixed,
    },
    duplicate: {
      type: String,
      enum: TRI_STATUS,
      default: TRI_STATUS.ANY,
    },
    with_error: {
      type: String,
      enum: TRI_STATUS,
      default: TRI_STATUS.ANY,
    },
    brm_info: {
      type: String,
    },
    sms_reply: {
      type: String,
    },
    experience: {
      type: String,
    },
    explanation: {
      type: String,
    },
    notes: {
      type: String,
    },
  },

  //--------------system details--------------
  system_details: {
    lead_file_name: {
      type: [Schema.Types.ObjectId],
      default: undefined,
    },
    api_user: {
      type: String,
    },
    created_at_operator: {
      type: Schema.Types.Mixed,
    },
    created_at_date: {
      type: Schema.Types.Mixed,
    },
    updated_at_operator: {
      type: Schema.Types.Mixed,
    },
    updated_at_date: {
      type: Schema.Types.Mixed,
    },
    is_deleted: {
      type: String,
      enum: TRI_STATUS,
      default: TRI_STATUS.ANY,
    },
  },

  //--------------custom details--------------
  custom_details: {
    field_1: {
      type: Schema.Types.Mixed,
    },
    field_2: {
      type: Schema.Types.Mixed,
    },
    field_3: {
      type: Schema.Types.Mixed,
    },
    field_4: {
      type: Schema.Types.Mixed,
    },
  },
});

const LeadEntityFilterModel = model<ILeadEntityFilterModel>(
  DB_COLLECTION_NAMES.LEAD_ENTITY_FILTERS,
  LeadEntityFilterSchema,
);

export default LeadEntityFilterModel;
export { LeadEntityFilterSchema };
