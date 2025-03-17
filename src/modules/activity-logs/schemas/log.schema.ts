import { BaseEntitySchemaContent } from '@common/schemas/base-entity.model';
import { DB_COLLECTION_NAMES } from '@constant/common/db-collection-names';
import { LOG_ACTIONS } from '@constant/activity-log/activity-log';
import { ILog, IModification } from '@interface/activity-log/activity-log';
import { Document, model, Schema } from 'mongoose';

export type ILogModel = ILog & Document;

const ModificationSchema = new Schema<IModification>({
  field_name: {
    type: String,
    required: true,
  },
  old_value: String,
  new_value: String,
});

const LogSchema = new Schema<ILog>({
  ...BaseEntitySchemaContent,
  schema: {
    type: String,
    enum: DB_COLLECTION_NAMES,
    index: true,
    unique: false,
  },
  action: {
    type: String,
    required: true,
    enum: LOG_ACTIONS,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  modifications: {
    type: [ModificationSchema],
    default: [],
  },
  extra: Schema.Types.Mixed,
});

const LogModel = model<ILogModel>(
  DB_COLLECTION_NAMES.LOGS,
  LogSchema as Schema<ILogModel>,
);
export default LogModel;
export { LogSchema };
