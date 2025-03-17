import { DB_COLLECTION_NAMES } from '@constant/common/db-collection-names';
import { IBaseEntity } from '@interface/common/base-entity';
import { LOG_ACTIONS } from '@constant/activity-log/activity-log';

export interface IModification {
  field_name: string;
  old_value: string;
  new_value: string;
}

export interface ILog extends IBaseEntity {
  schema?: DB_COLLECTION_NAMES;
  action: LOG_ACTIONS;
  date?: Date;
  modifications?: IModification[];
  extra?: any;

  // aggregated
  // changed_by_user?: any;
}

export interface PaginatedLogs {
  results: ILog[];
  count: [{ count: number }];
}
