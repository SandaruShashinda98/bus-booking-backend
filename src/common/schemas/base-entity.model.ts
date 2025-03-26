import { DB_COLLECTION_NAMES } from '@constant/common/db-collection-names';
import { Schema } from 'mongoose';

export const BaseEntitySchemaContent = {
  created_on: {
    type: Date,
    default: Date.now,
    index: true,
  },
  last_modified_on: {
    type: Date,
    default: Date.now,
  },
  is_active: {
    type: Boolean,
    default: true,
  },
  is_delete: {
    type: Boolean,
    default: false,
    index: true,
  },
  changed_by: {
    type: Schema.Types.Mixed,
    ref:DB_COLLECTION_NAMES.USERS,
    unique: false,
  },
  created_by: {
    type: Schema.Types.Mixed,
    ref:DB_COLLECTION_NAMES.USERS,
    unique: false,
  },
};
