import { Types } from 'mongoose';

export interface IPresignedUrlFormat {
  url: string;
  _id: Types.ObjectId;
}

export interface IMultiPartPresignedUrlFormat {
  _id?: Types.ObjectId;
  upload_id: string;
  key?: string;
}
