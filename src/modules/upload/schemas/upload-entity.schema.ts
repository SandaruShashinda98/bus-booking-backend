import { BaseEntitySchemaContent } from '@common/schemas/base-entity.model';
import { DB_COLLECTION_NAMES } from '@constant/common/db-collection-names';
import { FileStatusEnum, UploadStatusEnum } from '@constant/upload/upload';
import { IUpload } from '@interface/upload/upload';
import { Document, model, Schema } from 'mongoose';

export type IUploadModel = IUpload & Document;

const UploadSchema = new Schema<IUploadModel>({
  ...BaseEntitySchemaContent,
  original_file_name: {
    type: String,
    required: true,
  },

  file_name: {
    type: String,
    required: true,
  },

  csv_delimiter: {
    type: String,
  },

  csv_escape: {
    type: String,
  },

  ignore_first_line: {
    type: Boolean,
  },

  file_status: {
    type: String,
    enum: FileStatusEnum,
  },

  total_rows: {
    type: Number,
  },

  parsed_rows: {
    type: Number,
  },

  status: {
    type: Number,
    enum: UploadStatusEnum,
  },

  uploaded_at: {
    type: Date,
    required: true,
  },

  hlr_lookup: {
    type: String,
  },

  assigned_to: {
    type: String,
  },

  raw_columns: {
    type: [String],
  },

  new_columns: {
    type: [String],
  },

  key: {
    type: String,
  },
});

const UploadModel = model<IUpload>(DB_COLLECTION_NAMES.UPLOAD, UploadSchema);
export default UploadModel;
export { UploadSchema };
