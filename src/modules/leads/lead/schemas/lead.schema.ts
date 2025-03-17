import { BaseEntitySchemaContent } from '@common/schemas/base-entity.model';
import { DB_COLLECTION_NAMES } from '@constant/common/db-collection-names';
import { LEAD_DENY_STATUS } from '@constant/leads/leads';
import { ILead } from '@interface/leads/leads';
import { Document, model, Schema } from 'mongoose';

export type ILeadModel = ILead & Document;

const LeadSchema = new Schema<ILeadModel>({
  ...BaseEntitySchemaContent,

  first_name: {
    type: Schema.Types.Mixed,
  },
  last_name: {
    type: Schema.Types.Mixed,
  },
  phone: {
    type: Schema.Types.Mixed,
  },
  phone_number_normalized: {
    type: Schema.Types.Mixed,
  },
  secondary_phone: {
    type: Schema.Types.Mixed,
  },
  email: {
    type: Schema.Types.Mixed,
  },
  age: {
    type: Schema.Types.Mixed,
  },
  education: {
    type: Schema.Types.Mixed,
  },
  country: {
    type: Schema.Types.Mixed,
  },
  city: {
    type: Schema.Types.Mixed,
  },
  state: {
    type: Schema.Types.Mixed,
  },
  address: {
    type: Schema.Types.Mixed,
  },
  address_1: {
    type: Schema.Types.Mixed,
  },
  address_2: {
    type: Schema.Types.Mixed,
  },
  zip_code: {
    type: Schema.Types.Mixed,
  },
  timezone: {
    type: Schema.Types.Mixed,
  },
  // custom: [{ type: Schema.Types.Mixed }],
  deny_status: {
    enum: LEAD_DENY_STATUS,
    type: String,
    default: LEAD_DENY_STATUS.ALLOWED,
  },
  original_identifier: {
    type: Schema.Types.Mixed,
  },
  support_site: {
    type: Schema.Types.Mixed,
  },
  purchase_site: {
    type: Schema.Types.Mixed,
  },
  purchase_date: {
    type: Schema.Types.Mixed,
  },
  purchase_amount: {
    type: Schema.Types.Mixed,
  },
  product_name: {
    type: Schema.Types.Mixed,
  },
  credit_card_name: {
    type: Schema.Types.Mixed,
  },

  //--- reference fields ---
  // upload_id: {
  //   type: Schema.Types.ObjectId,
  //   ref: DB_COLLECTION_NAMES.LEAD_FILES,
  //   default: null,
  // },
  // campaign_id: {
  //   type: Schema.Types.ObjectId,
  //   ref: DB_COLLECTION_NAMES.LEAD_CAMPAIGN,
  //   default: null,
  // },
});

const LeadModel = model<ILeadModel>(DB_COLLECTION_NAMES.LEADS, LeadSchema);
export default LeadModel;
export { LeadSchema };
