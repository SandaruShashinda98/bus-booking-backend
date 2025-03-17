import { BaseEntitySchemaContent } from '@common/schemas/base-entity.model';
import { DB_COLLECTION_NAMES } from '@constant/common/db-collection-names';
import { IAuthCredentials } from '@interface/authorization/user';
import { Document, model, Schema } from 'mongoose';

export type IAuthCredentialsModel = IAuthCredentials & Document;

const AuthCredentialSchema = new Schema<IAuthCredentialsModel>({
  ...BaseEntitySchemaContent,
  user_id: {
    type: Schema.Types.ObjectId,
  },
  token: {
    type: String,
  },
  refresh_token: {
    type: String,
  },
  password: {
    type: String,
  },
  expires_at: {
    type: Schema.Types.Mixed,
  },
  reset_token: {
    type: String,
  },
});

const AuthCredentialModel = model<IAuthCredentialsModel>(
  DB_COLLECTION_NAMES.AUTH_CREDENTIALS,
  AuthCredentialSchema,
);
export default AuthCredentialModel;
export { AuthCredentialSchema };
