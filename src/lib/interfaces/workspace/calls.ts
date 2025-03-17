import {
  SYSTEM_STATUS,
  FEEDBACK_STATUS,
  HANGUP_DISPOSITION,
  OBJECT_TYPE_ID,
} from '@constant/workspace/calls';
import { IBaseEntity } from '@interface/common/base-entity';

export interface IAudioData {
  name: string;
}

export interface ICall extends IBaseEntity {
  //This call id is implemented such that an id will be assigned to every call - if not remove the attribute
  call_id: string;
  phone_number: string;
  system_status: SYSTEM_STATUS;
  feedback_status: FEEDBACK_STATUS;
  hangup_disposition: HANGUP_DISPOSITION;
  initiated_time: Date;
  answered_time: Date;
  end_time: Date;
  audio_data: IAudioData;
  object_type_id: OBJECT_TYPE_ID;
}
