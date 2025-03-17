import { FileStatusEnum } from '@constant/upload/upload';
import { IBaseEntity } from '@interface/common/base-entity';
import { Types } from 'mongoose';

export interface IUpload extends IBaseEntity {
  original_file_name: string;
  file_status?: FileStatusEnum;
  file_name: string;
  csv_delimiter?: string;
  csv_escape?: string;
  ignore_first_line?: boolean;
  total_rows?: number;
  parsed_rows?: number;
  status: number;
  key: string;
  uploaded_at: Date;
  hlr_lookup?: string;
  assigned_to?: string;
  country_data?: Array<{ name: string; value: number }>;
  raw_columns?: Array<string>;
  new_columns?: Array<string>;
}

export interface IPythonRequest {
  key: string;
  id: string;
  pageIndex: number;
  pageSize: number;
}
