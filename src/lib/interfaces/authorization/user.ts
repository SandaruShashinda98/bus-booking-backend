import { PERMISSIONS } from '@constant/authorization/roles';
import { IBaseEntity } from '@interface/common/base-entity';
import { Types } from 'mongoose';

export interface IUser extends IBaseEntity {
  first_name: string;
  last_name: string;
  email: string;
  username: string;
  role: Types.ObjectId[];
  dob?: Date;
  contact_number?: string;
  nic?: string;
  employee_id?: string;
}

export type ILoggedUser = IUser & Pick<ILoginPayload, 'permissions'>;

export interface IAuthCredentials extends IBaseEntity {
  user_id: Types.ObjectId; // object id of the user
  token: string;
  refresh_token: string;
  password: string;
  expires_at: any;
  reset_token?: string;
}

export interface ILoginPayload {
  _id: Types.ObjectId | string;
  username: string;
  permissions: PERMISSIONS[];
}

export interface IUserGroup extends IBaseEntity {
  user_id: Types.ObjectId;
  group_id: Types.ObjectId;
  group_type: number;
}
