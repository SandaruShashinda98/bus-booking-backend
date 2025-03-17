import { BaseEntitySchemaContent } from '@common/schemas/base-entity.model';
import { DB_COLLECTION_NAMES } from '@constant/common/db-collection-names';
import {
  SYSTEM_STATUS,
  FEEDBACK_STATUS,
  HANGUP_DISPOSITION,
  OBJECT_TYPE_ID,
} from '@constant/workspace/calls';
import { ICall } from '@interface/workspace/calls';
import { Document, model, Schema } from 'mongoose';

export type ICallModel = ICall & Document;

const CallSchema = new Schema<ICallModel>({
  ...BaseEntitySchemaContent,
  call_id: {
    type: String,
    required: true,
  },
  phone_number: {
    type: String,
    required: true,
  },
  system_status: {
    enum: SYSTEM_STATUS,
    type: Number,
    required: true,
  },
  feedback_status: {
    enum: FEEDBACK_STATUS,
    type: Number,
    required: false,
    default: null,
  },
  hangup_disposition: {
    enum: HANGUP_DISPOSITION,
    type: Number,
    required: false,
    default: null,
  },
  initiated_time: {
    type: Date,
    required: true,
  },
  answered_time: {
    type: Date,
    required: false,
    index: true,
    default: null,
  },
  end_time: {
    type: Date,
    required: false,
    default: null,
    index: true,
  },
  audio_data: {
    name: {
      type: String,
      required: false,
      default: null,
    },
  },
  object_type_id: {
    enum: OBJECT_TYPE_ID,
    type: Number,
    required: true,
  },
});

//TODO create compound indexes for calls and other collections where ne

const CallModel = model<ICallModel>(DB_COLLECTION_NAMES.CALLS, CallSchema);

export default CallModel;
export { CallSchema };
