import { TRUNK_STATE } from '@constant/settings/trunks';
import { IBaseEntity } from '@interface/common/base-entity';

export interface ITrunks extends IBaseEntity {
  name: string;
  uri: string;
  state: TRUNK_STATE;
  sip_username:string;
  sip_password:string;
  tech_prefix:string;
  server:string;
  country_rules:unknown[];
}
