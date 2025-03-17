import { convertToIdArray } from '@common/helpers/custom.helper';
import { filterByName } from '@common/helpers/filter.helper';
import {
  FILTER_GROUP_CONNECTOR,
  FILTER_GROUP_SETTING,
  FILTER_GROUP_STATE_OPTIONS,
} from '@constant/groups/groups';
import {
  IFilterGroup,
  IFilterGroupSetting,
  IGroup,
} from '@interface/groups/groups';
import { ObjectListsDatabaseService } from '@module/settings/services/object-list.database.service';
import { Injectable } from '@nestjs/common';
import { FilterQuery } from 'mongoose';

interface FilterConditions {
  orConditions: any[];
  andConditions: any[];
}

@Injectable()
export class LeadGroupFilterService {
  constructor(
    private readonly objectListDatabaseService: ObjectListsDatabaseService,
  ) {}

  async filterLeadsByGroup(group: IGroup, searchKey?: string) {
    if (!group?.filter_groups || group.filter_groups?.length === 0) {
      return {};
    }

    const conditions = await this.buildFilterQuery(group.filter_groups);
    const mongoQuery = this.buildMongoQuery(conditions);

    if (searchKey) {
      return {
        $and: [mongoQuery, filterByName(searchKey)],
      };
    }

    return mongoQuery;
  }

  private async buildFilterQuery(
    filterGroups: IFilterGroup[],
  ): Promise<FilterConditions> {
    if (!filterGroups || filterGroups?.length === 0) {
      return { orConditions: [], andConditions: [] };
    }

    const result: FilterConditions = {
      orConditions: [],
      andConditions: [],
    };

    for (const group of filterGroups) {
      const groupConditions = await this.processFilterSettings(
        group.filter_settings || [],
      );
      result.orConditions.push(...groupConditions.orConditions);
      result.andConditions.push(...groupConditions.andConditions);
    }

    return result;
  }

  private async processFilterSettings(
    filterSettings: IFilterGroupSetting[],
  ): Promise<FilterConditions> {
    if (!filterSettings || filterSettings?.length === 0) {
      return { orConditions: [], andConditions: [] };
    }

    return this.groupConditionsByConnector(filterSettings);
  }

  private async groupConditionsByConnector(
    filterSettings: IFilterGroupSetting[],
  ): Promise<FilterConditions> {
    const orConditions: any[] = [];
    const andConditions: any[] = [];

    for (const setting of filterSettings) {
      const condition = await this.buildCondition(setting);
      if (!condition) continue;

      if (setting.connector === FILTER_GROUP_CONNECTOR.OR) {
        orConditions.push(condition);
      } else {
        andConditions.push(condition);
      }
    }

    return { orConditions, andConditions };
  }

  private async buildCondition(setting: IFilterGroupSetting) {
    switch (setting.filter_group) {
      case FILTER_GROUP_SETTING.CAMPAIGN:
        return this.buildCampaignCondition(setting);
      case FILTER_GROUP_SETTING.LEAD_FILE:
        return this.buildLeadFileCondition(setting);
      case FILTER_GROUP_SETTING.PURCHASE_DATE:
        return this.buildDateCondition(setting);
      case FILTER_GROUP_SETTING.PREDEFINED_OBJECT_LIST:
        return this.buildObjectListCondition(setting);
      case FILTER_GROUP_SETTING.SYSTEM_STATUS:
        return this.buildStatusCondition(setting);
      case FILTER_GROUP_SETTING.LEAD_ASSIGN_TO:
        return this.buildAssignmentCondition(setting);
      default:
        return null;
    }
  }

  private buildCampaignCondition(setting: any): any {
    const inputArray = convertToIdArray(setting.input_value);

    switch (setting.filter_group_state) {
      case FILTER_GROUP_STATE_OPTIONS.IS:
        return { campaign_id: { $in: inputArray } };
      case FILTER_GROUP_STATE_OPTIONS.IS_NOT:
        return { campaign_id: { $nin: inputArray } };
      default:
        return null;
    }
  }

  private buildLeadFileCondition(setting: any): any {
    const inputArray = convertToIdArray(setting.input_value);

    switch (setting.filter_group_state) {
      case FILTER_GROUP_STATE_OPTIONS.IS:
        return { upload_id: { $in: inputArray } };
      case FILTER_GROUP_STATE_OPTIONS.IS_NOT:
        return { upload_id: { $nin: inputArray } };
      default:
        return null;
    }
  }

  private buildStatusCondition(setting: any): any {
    const inputArray = convertToIdArray(setting.input_value);

    switch (setting.filter_group_state) {
      case FILTER_GROUP_STATE_OPTIONS.IS:
        return { status: { $in: inputArray } };
      case FILTER_GROUP_STATE_OPTIONS.IS_NOT:
        return { status: { $nin: inputArray } };
      default:
        return null;
    }
  }

  private buildAssignmentCondition(setting: any): any {
    const inputArray = convertToIdArray(setting.input_value);

    switch (setting.filter_group_state) {
      case FILTER_GROUP_STATE_OPTIONS.IS:
        return { assigned_to: { $in: inputArray } };
      case FILTER_GROUP_STATE_OPTIONS.IS_NOT:
        return { assigned_to: { $nin: inputArray } };
      default:
        return null;
    }
  }

  private async buildObjectListCondition(setting: any) {
    const inputArray = convertToIdArray(setting.input_value);

    const objectList = await this.objectListDatabaseService.filterDocuments({
      _id: { $in: inputArray },
    });

    const countryList: string[] = objectList
      .filter((list) => list.list_type === 'COUNTRIES')
      .map((list) => list.objects.map((obj: any) => obj.name))
      .flat();

    switch (setting.filter_group_state) {
      case FILTER_GROUP_STATE_OPTIONS.IS:
        return { country: { $in: countryList } };
      case FILTER_GROUP_STATE_OPTIONS.IS_NOT:
        return { country: { $nin: countryList } };
      default:
        return null;
    }
  }

  private buildDateCondition(setting: any): any {
    const now = new Date();

    switch (setting.filter_group_state) {
      case FILTER_GROUP_STATE_OPTIONS.WITHIN_LAST_DAYS:
        const daysAgo = new Date(
          now.getTime() - Number(setting.input_value) * 24 * 60 * 60 * 1000,
        );
        return { purchase_date: { $gte: daysAgo } };

      case FILTER_GROUP_STATE_OPTIONS.WITHIN_LAST_HOUR:
        const hourAgo = new Date(now.getTime() - 60 * 60 * 1000);
        return { purchase_date: { $gte: hourAgo } };

      case FILTER_GROUP_STATE_OPTIONS.WITHIN_LAST_MINUTE:
        const minuteAgo = new Date(now.getTime() - 60 * 1000);
        return { purchase_date: { $gte: minuteAgo } };

      default:
        return null;
    }
  }

  private buildMongoQuery(conditions: FilterConditions): FilterQuery<any> {
    const { orConditions, andConditions } = conditions;
    const queryParts = [];

    // Handle OR conditions
    if (orConditions && orConditions.length > 0) {
      queryParts.push({ $or: orConditions });
    }

    // Handle AND conditions
    if (andConditions && andConditions.length > 0) {
      // Group conditions by field name
      const groupedConditions = andConditions.reduce((acc, condition) => {
        const field = Object.keys(condition)[0];
        if (!acc[field]) {
          acc[field] = [];
        }
        acc[field].push(condition[field]);
        return acc;
      }, {});

      // Merge conditions for each field
      Object.entries(groupedConditions).forEach(([field, operators]) => {
        const mergedCondition = {};
        const inValues = new Set();
        const ninValues = new Set();

        (operators as any[]).forEach((operator: any) => {
          if (operator.$in) {
            operator.$in.forEach((val) => inValues.add(val));
          }
          if (operator.$nin) {
            operator.$nin.forEach((val) => ninValues.add(val));
          }
        });

        if (inValues.size > 0) {
          mergedCondition['$in'] = Array.from(inValues);
        }
        if (ninValues.size > 0) {
          mergedCondition['$nin'] = Array.from(ninValues);
        }

        if (Object.keys(mergedCondition).length > 0) {
          queryParts.push({ [field]: mergedCondition });
        }
      });
    }

    return queryParts.length > 0 ? { $and: queryParts } : {};
  }
}
