import { ACTIVITY_TYPES } from '@constant/activity/activity';
import { DB_COLLECTION_NAMES } from '@constant/common/db-collection-names';
import { IActivity } from '@interface/activity/activity';
import { Document, model, Schema, Types } from 'mongoose';

export type IActivityModel = IActivity & Document;

const ActivitySchema = new Schema<IActivityModel>({
  user_id: {
    type: Schema.Types.ObjectId,
  },
  activity_type: {
    type: String,
    enum: ACTIVITY_TYPES,
  },
});

const ActivityModel = model<IActivity>(
  DB_COLLECTION_NAMES.ACTIVITY,
  ActivitySchema,
);
export default ActivityModel;
export { ActivitySchema };
