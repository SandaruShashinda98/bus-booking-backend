import { IBaseEntity } from '@interface/common/base-entity';

export interface ISkillGroup extends IBaseEntity {
  name: string;
  description?: string;
}
