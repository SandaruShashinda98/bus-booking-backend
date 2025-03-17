import { BaseEntitySchemaContent } from '@common/schemas/base-entity.model';
import { DB_COLLECTION_NAMES } from '@constant/common/db-collection-names';
import { ISkillGroup } from '@interface/groups/skill-group';
import { Document, model, Schema } from 'mongoose';

export type ISkillGroupModel = ISkillGroup & Document;

const SkillGroupSchema = new Schema<ISkillGroupModel>({
  ...BaseEntitySchemaContent,
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
});

const SkillGroupModel = model<ISkillGroupModel>(
  DB_COLLECTION_NAMES.SKILL_GROUPS,
  SkillGroupSchema,
);
export default SkillGroupModel;
export { SkillGroupSchema };
