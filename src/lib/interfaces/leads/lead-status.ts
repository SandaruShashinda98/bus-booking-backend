import { IBaseEntity } from '@interface/common/base-entity';
import { Types } from 'mongoose';

export interface ILeadStatus extends IBaseEntity {
  _id: Types.ObjectId;
  name: string;
  description?: string;
  background_color: string;
  text_color: string;
  feedback_requirements?: string[];
  status_workflow?: string[];
  api_mapping?: string;
  campaign_id: Types.ObjectId;
}
