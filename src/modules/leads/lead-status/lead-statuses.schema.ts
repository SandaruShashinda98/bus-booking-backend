import { BaseEntitySchemaContent } from '@common/schemas/base-entity.model';
import { DB_COLLECTION_NAMES } from '@constant/common/db-collection-names';
import { ILeadStatus } from '@interface/leads/lead-status';
import { model, Schema, Document } from 'mongoose';

export type ILeadStatusModel = ILeadStatus & Document;

const LeadStatusSchema = new Schema<ILeadStatusModel>({
  ...BaseEntitySchemaContent,
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default: '',
  },
  background_color: {
    type: String,
    required: true,
  },

  text_color: {
    type: String,
    required: true,
  },

  feedback_requirements: [
    {
      type: String,
      required: true,
    },
  ],

  status_workflow: [
    {
      type: String,
      required: true,
    },
  ],

  api_mapping: {
    type: String,
    default: '',
  },
  campaign_id: {
    type: Schema.Types.ObjectId,
    ref: DB_COLLECTION_NAMES.LEAD_CAMPAIGN,
    required: true,
  },
});

const LeadStatusModel = model<ILeadStatus>(
  DB_COLLECTION_NAMES.LEAD_STATUS,
  LeadStatusSchema,
);

export default LeadStatusModel;

export { LeadStatusSchema };
