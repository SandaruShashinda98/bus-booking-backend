import { BaseEntitySchemaContent } from '@common/schemas/base-entity.model';
import { DB_COLLECTION_NAMES } from '@constant/common/db-collection-names';
import { ANSWERING_MACHINE_DETECTION } from '@constant/leads/lead-campaign';
import { ILeadCampaign } from '@interface/leads/lead-campaign';
import { Document, model, Schema } from 'mongoose';

export type ILeadCampaignModel = ILeadCampaign & Document;

const LeadCampaignSchema = new Schema<ILeadCampaignModel>({
  ...BaseEntitySchemaContent,
  total_leads: {
    type: Number,
    default: 0,
  },
  available_leads: {
    type: Number,
    default: 0,
  },

  status: [
    {
      id: {
        type: Schema.Types.ObjectId,
        ref: DB_COLLECTION_NAMES.LEAD_STATUS,
        required: true,
      },
      value: { type: Number, default: 0 },
    },
  ],

  general: {
    name: {
      type: String,
      required: true,
    },

    description: {
      type: String,
      required: false,
      default: '',
    },

    randomize_caller_id: {
      required: true,
      type: Boolean,
      default: true,
    },

    is_active_campaign: {
      required: false,
      type: Boolean,
      default: true,
    },

    mask_phone_numbers: {
      required: true,
      type: Boolean,
      default: false,
    },

    feedback_page_settings: {
      feedback_page_timeout: {
        required: true,
        type: Number,
        min: 15,
        max: 300,
      },

      feedback_timeout_status: {
        type: String,
        // required: true, // TODO Make this required true after lead status implementation
        required: false,
      },

      redial_limit: {
        required: true,
        type: Number,
        min: 0,
        max: 1000,
      },
    },

    permanent_assignment_settings: {
      permanent_assignment_expiration_days: {
        required: true,
        type: Number,
        min: 0,
        max: 60,
      },

      permanent_assignment_offline_agent_days: {
        required: true,
        type: Number,
        min: 1,
        max: 60,
      },

      permanent_assignment_12_hours_limit_per_agent: {
        required: true,
        type: Number,
        min: 0,
        max: 50,
      },

      permanent_assignment_total_limit_per_agent: {
        required: true,
        type: Number,
        min: 0,
        max: 1000,
      },
    },
  },

  direct_dial_settings: {
    direct_dial_minimum_weight: {
      required: true,
      type: Number,
      min: 0,
      max: 10000,
    },

    call_hour_settings: {
      covert_calling_hours_to: {
        type: String,
      },

      country_to_call: [
        {
          country: {
            type: String,
            required: true,
          },
          from: {
            type: String,
            required: true,
          },
          to: {
            type: String,
            required: true,
          },
          time_zone_of_selected_country: {
            required: true,
            type: String,
          },
        },
      ],
    },

    predictive_dialer_settings: {
      delay_before_showing_end_button: {
        required: true,
        type: Number,
        default: 5,
        min: 0,
        max: 10,
      },

      maximum_ringing_duration: {
        required: true,
        type: Number,
        default: 30,
        min: 2,
        max: 60,
      },

      call_connection_timeout: {
        required: true,
        type: Number,
        default: 60,
        min: 2,
        max: 60,
      },

      default_status_no_answer: {
        type: String,
        required: true,
      },

      default_status_no_answer_value: {
        type: Number,
        default: 0,
        required: true,
      },

      default_status_busy_line: {
        type: String,
        required: true,
      },
      default_status_busy_line_value: {
        type: Number,
        default: 0,
        required: true,
      },

      default_status_for_connection_error: {
        type: String,
      },

      default_status_for_connection_error_value: {
        type: Number,
        default: 0,
        required: true,
      },
    },
  },

  dropped_call_settings: {
    status_for_dropped_calls: {
      type: String,
      required: true,
    },

    status_for_dropped_calls_value: {
      type: Number,
      default: 0,
      required: true,
    },

    audio_file_key: {
      type: String,
      required: false,
    },

    audio_file_size: {
      type: Number,
      required: false,
      default: null,
    },

    wait_time_for_agent_availability: {
      type: Schema.Types.Number,
      required: false,
      min: 0,
      max: 60,
    },
  },

  voice_mail_settings: {
    default_status_for_voice_mail: {
      type: String,
      required: true,
    },

    default_status_for_voice_mail_value: {
      type: Number,
      default: 0,
      required: true,
    },

    voice_mail_button_status: {
      type: String,
      required: false,
    },

    voice_mail_button_status_value: {
      type: Number,
      default: 0,
      required: true,
    },

    hide_voice_mail_button_for_assigned_leads: {
      type: Boolean,
      default: false,
    },

    hide_voice_mail_button_after: {
      type: Number,
      required: true,
      min: 0,
      max: 60,
    },

    show_voice_mail_button_after: {
      type: Number,
      required: true,
      min: 0,
      max: 60,
    },

    answering_machine_detection: {
      type: String,
      enum: ANSWERING_MACHINE_DETECTION,
      required: true,
    },

    maximum_answering_machine_detection_duration: {
      required: false,
      type: Number,
      min: 0,
      max: 60,
    },
  },
});

const LeadCampaignModel = model<ILeadCampaign>(
  DB_COLLECTION_NAMES.LEAD_CAMPAIGN,
  LeadCampaignSchema,
);

export default LeadCampaignModel;
export { LeadCampaignSchema };
