import { BaseEntitySchemaContent } from '@common/schemas/base-entity.model';
import { DB_COLLECTION_NAMES } from '@constant/common/db-collection-names';
import { TRUNK_STATE } from '@constant/settings/trunks';
import { ITrunks } from '@interface/settings/trunks';
import { Document, model, Schema } from 'mongoose';

export type ITrunksModel = ITrunks & Document;

const TrunksSchema = new Schema<ITrunksModel>({
  ...BaseEntitySchemaContent,
  name: {
    type: String,
    required: true,
  },
  uri: {
    type: String,
    required: true,
  },
  state: {
    enum: TRUNK_STATE,
    type: String,
    required: true,
  },
  sip_username: {
    type: String,
    required: true,
  },
  sip_password: {
    type: String,
    required: true,
  },
  tech_prefix:{
    type: String,
    required: true,
  },
  server:{
    type: String,
    required: true,
  },
  country_rules:[{
    checked:{
      type:Boolean,
    },
    code:{
      type:String,
    },
    dial_codes:[String],
    image:{
      type:String,
    },
    name:String
  }]

});

const TrunksModel = model<ITrunks>(DB_COLLECTION_NAMES.TRUNKS, TrunksSchema);

export default TrunksModel;
export { TrunksSchema };
