import { BaseEntitySchemaContent } from '@common/schemas/base-entity.model';
import { DB_COLLECTION_NAMES } from '@constant/common/db-collection-names';
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
  dob: {
    type: Date,
  },
  contact_number: {
    type: String,
  },
  nic: {
    type: String,
  },
  employee_id: {
    type: String,
  },
  user_role: {
    type:String,
    default: "ADMIN"
  }
});

const UserModel = model<IUserModel>(DB_COLLECTION_NAMES.USERS, UserSchema);
export default UserModel;
export { UserSchema };
