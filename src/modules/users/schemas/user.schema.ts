import { BaseEntitySchemaContent } from '@common/schemas/base-entity.model';
import { DB_COLLECTION_NAMES } from '@constant/common/db-collection-names';
import {
  SIP_SETTINGS,
  TWO_FACTOR_AUTHENTICATION_TYPE,
  USER_STATUS,
} from '@constant/authorization/user';
import { IUser } from '@interface/authorization/user';
import { Document, model, Schema } from 'mongoose';

export type IUserModel = IUser & Document;

const UserSchema = new Schema<IUserModel>({
  ...BaseEntitySchemaContent,
  first_name: {
    type: String,
    required: true,
  },
  last_name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  username: {
    type: String,
    required: true,
    unique: true,
  },
  role: [
    {
      type: Schema.Types.ObjectId,
      ref: DB_COLLECTION_NAMES.ROLES,
      required: true,
    },
  ],
  last_login: {
    type: Date,
  },
  two_factor_authentication_type: {
    type: String,
    enum: TWO_FACTOR_AUTHENTICATION_TYPE,
    default: TWO_FACTOR_AUTHENTICATION_TYPE.DISABLED,
  },
  status: {
    type: String,
    enum: USER_STATUS,
    default: USER_STATUS.OFFLINE,
    required:false,
  },

  //------ not using -------
  add_to_currant_and_future_desks: {
    type: Boolean,
    default: false,
  },
  add_to_currant_and_future_skill_groups: {
    type: Boolean,
  },
  is_assign_leads: {
    type: Boolean,
  },
  virtual_extension: {
    type: Number,
  },
  sip_setting: {
    type: String,
    enum: SIP_SETTINGS,
  },
  max_concurrent_sessions: {
    type: Number,
  },
  devices: {
    type: [String],
  },

  status_changed_at: {
    type: Date,
  },
});

const UserModel = model<IUserModel>(DB_COLLECTION_NAMES.USERS, UserSchema);
export default UserModel;
export { UserSchema };
