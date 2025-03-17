import { ANSWERING_MACHINE_DETECTION } from '@constant/leads/lead-campaign';
import { IBaseEntity } from '@interface/common/base-entity';
import { Types } from 'mongoose';

export interface ILeadCampaign extends IBaseEntity {
  _id: Types.ObjectId;
  total_leads?: number;
  available_leads?: number;

  status: [
    {
      id: Types.ObjectId;
      value: number;
    },
  ];

  //general settings
  general: {
    name: string;
    description?: string;
    randomize_caller_id: boolean;
    is_active_campaign: boolean;
    mask_phone_numbers: boolean;
    //feedback page settings
    feedback_page_settings: {
      feedback_page_timeout: number;
      feedback_timeout_status: string;
      redial_limit: number;
    };

    permanent_assignment_settings: {
      //permanent assignment settings
      permanent_assignment_expiration_days: number;
      permanent_assignment_offline_agent_days: number;
      permanent_assignment_12_hours_limit_per_agent: number;
      permanent_assignment_total_limit_per_agent: number;
    };
  };

  //direct dial settings
  direct_dial_settings: {
    direct_dial_minimum_weight: number;
    //call hour settings
    call_hour_settings: {
      covert_calling_hours_to: string;

      country_to_call: {
        country: string;
        from: string;
        to: string;
      }[];
    };

    //predictive dialer settings
    predictive_dialer_settings: {
      delay_before_showing_end_button: number;
      maximum_ringing_duration: number;
      call_connection_timeout: number;

      default_status_no_answer: string;
      default_status_no_answer_value: number;

      default_status_busy_line: string;
      default_status_busy_line_value: number;

      default_status_for_connection_error: string;
      default_status_for_connection_error_value: number;
    };
  };

  //dropped call settings
  dropped_call_settings: {
    status_for_dropped_calls: string;
    status_for_dropped_calls_value: number;
    audio_file_key?: string;
    audio_file_size?: number;
    wait_time_for_agent_availability: number;
  };

  voice_mail_settings: {
    //voice mail settings
    default_status_for_voice_mail: string;
    default_status_for_voice_mail_value: number;

    voice_mail_button_status?: string;
    voice_mail_button_status_value: number;

    hide_voice_mail_button_for_assigned_leads: boolean;
    hide_voice_mail_button_after: number;

    show_voice_mail_button_after: number;

    answering_machine_detection: ANSWERING_MACHINE_DETECTION;

    maximum_answering_machine_detection_duration?: number;
  };
}
