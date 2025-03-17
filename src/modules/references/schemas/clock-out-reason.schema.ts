import { BaseEntitySchemaContent } from '@common/schemas/base-entity.model';
import { DB_COLLECTION_NAMES } from '@constant/common/db-collection-names';
import { IClockOutReason } from '@interface/references/reference';
import { Document, model, Schema } from 'mongoose';

export type IClockOutReasonModel = IClockOutReason & Document;

const ClockOutReasonSchema = new Schema<IClockOutReasonModel>({
  ...BaseEntitySchemaContent,
  reason: {
    type: String,
    required: true,
  },
});

const ClockOutReasonModel = model<IClockOutReasonModel>(
  DB_COLLECTION_NAMES.CLOCK_OUT_REASONS,
  ClockOutReasonSchema,
);
export default ClockOutReasonModel;
export { ClockOutReasonSchema };
