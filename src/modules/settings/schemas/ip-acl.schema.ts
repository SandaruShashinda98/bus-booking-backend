import { BaseEntitySchemaContent } from '@common/schemas/base-entity.model';
import { DB_COLLECTION_NAMES } from '@constant/common/db-collection-names';
import { IIpACL } from '@interface/settings/general-settings';
import { Document, model, Schema } from 'mongoose';

export type IIpACLModel = IIpACL & Document;

const SIpACLSchema = new Schema<IIpACLModel>({
  ...BaseEntitySchemaContent,
  ip_address: {
    type: String,
    required: true,
    unique: true,
  },

  description: {
    type: String,
  },
});

const IpACLModel = model<IIpACLModel>(DB_COLLECTION_NAMES.IP_ACL, SIpACLSchema);
export default IpACLModel;
export { SIpACLSchema };
