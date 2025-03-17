import { BaseEntitySchemaContent } from '@common/schemas/base-entity.model';
import { DB_COLLECTION_NAMES } from '@constant/common/db-collection-names';
import { USER_GROUP_TYPE } from '@constant/groups/groups';
import { IUserGroup } from '@interface/authorization/user';
import { Document, model, Schema } from 'mongoose';

export type IUserGroupModel = IUserGroup & Document;

const UserGroupSchema = new Schema<IUserGroupModel>({
  ...BaseEntitySchemaContent,
  user_id: { type: Schema.ObjectId },
  group_id: { type: Schema.ObjectId },
  group_type: { type: Number, enum: USER_GROUP_TYPE },
});

const UserGroupModel = model<IUserGroupModel>(
  DB_COLLECTION_NAMES.USER_GROUPS,
  UserGroupSchema,
);

export default UserGroupModel;
export { UserGroupSchema };
