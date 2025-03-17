import {
  AVAILABILITY_STATUS,
  HLR_STATUS,
  LEAD_DENY_STATUS,
  LEAD_STATE,
  TRI_STATUS,
} from '@constant/leads/leads';
import { IBaseEntity } from '@interface/common/base-entity';
import { Types } from 'mongoose';

export interface ILead extends IBaseEntity {
  _id: Types.ObjectId;
  first_name?: any;
  last_name?: any;
  phone?: any;
  phone_number_normalized?: any;
  secondary_phone?: any;
  email?: any;
  age?: any;
  education?: any;
  country?: any;
  city?: any;
  state?: any;
  address?: any;
  address_1?: any;
  address_2?: any;
  zip_code?: any;
  timezone?: any;
  // custom?: any[];
  original_identifier?: any;
  support_site?: any;
  purchase_site?: any;
  purchase_date?: any;
  purchase_amount?: any;
  product_name?: any;
  credit_card_name?: any;
  deny_status: LEAD_DENY_STATUS;
  //--- reference fields ---
  // upload_id: any;
  // campaign_id?: Types.ObjectId;
}

export interface ILeadEntity {
  lead_id: Types.ObjectId;
  first_name: string;
  last_name: string;
  phone: string;
  secondary_phone?: string;
  address_line1: string;
  address_line2: string;
  city: string;
  state: string;
  zip_code: string;
  country: string;
  original_identifier: any;
  support_site: string;
  purchase_date: Date;
  purchase_amount: number;
  product_name: string;
  credit_card_name: string;
}

//--------- lead comment related ------------
export interface ILeadComment extends IBaseEntity {
  lead_id: Types.ObjectId;
  comment: string;
}

//--------- lead filter related ------------
interface ILeadDetails {
  lead_id?: number;
  first_name?: string;
  last_name?: string;
  phone_number?: string;
  phone_number_normalized?: string;
  secondary_phone?: string;
  email?: string;
  age?: number;
  education?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: any[];
  time_zone?: any[];
}

interface ICampaignsAndEngagementDetails {
  campaigns?: Types.ObjectId[];
  status?: any[];
  sub_status?: any[];
  availability?: AVAILABILITY_STATUS[];
  hlr?: HLR_STATUS[];
  lead_state?: LEAD_STATE[];
  weight?: number;
  calls?: number;
  funnel?: string;
  tag?: string;
  original_identifier?: number;
  assign_to?: any[];
  start_lead_period?: Date;
  end_lead_period?: Date;
  call_after?: any;
  duplicate?: TRI_STATUS;
  with_error?: TRI_STATUS;
  brm_info?: string;
  sms_reply?: string;
  experience?: string;
  explanation?: string;
  notes?: string;
}

interface ISystemDetails {
  lead_file_name?: Types.ObjectId[];
  api_user?: string;
  created_at_operator?: any;
  created_at_date?: any;
  updated_at_operator?: any;
  updated_at_date?: any;
  is_deleted?: TRI_STATUS; // TODO:@sahan change this property name
}

interface ICustomDetails {
  field_1?: any;
  field_2?: any;
  field_3?: any;
  field_4?: any;
}

export interface ILeadFilter extends IBaseEntity {
  filter_name?: string;
  count?: number;
  lead_details?: ILeadDetails;
  campaigns_and_engagement_details?: ICampaignsAndEngagementDetails;
  system_details?: ISystemDetails;
  custom_details?: ICustomDetails;
}
