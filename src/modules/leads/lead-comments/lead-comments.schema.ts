import { BaseEntitySchemaContent } from '@common/schemas/base-entity.model';
import { DB_COLLECTION_NAMES } from '@constant/common/db-collection-names';
import { ILeadComment } from '@interface/leads/leads';
import { Document, model, Schema } from 'mongoose';

export type ILeadCommentModel = ILeadComment & Document;

const LeadCommentSchema = new Schema<ILeadCommentModel>({
  ...BaseEntitySchemaContent,
  lead_id: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: DB_COLLECTION_NAMES.LEADS,
  },
  comment: {
    type: String,
    required: true,
  },
});

const LeadCommentModel = model<ILeadCommentModel>(
  DB_COLLECTION_NAMES.LEAD_COMMENTS,
  LeadCommentSchema,
);
export default LeadCommentModel;
export { LeadCommentSchema };
